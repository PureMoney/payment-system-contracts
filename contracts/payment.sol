// An instance of this contract is created for every vendor. It's a "Forwarding Contract".
// The constructor is run during POS registration, and it helps in enforcing locality of evangelist.
// Enforcement of locality is done during POS registration. However, enforcement is done in the central server,
// with help from these three smart contracts. The POS installation will fail for any of the following reasons:
//   1. The evangelist doing the installation does not own local tokens;
//   2. The local tokens owned by the evangelist do not match the political territory of the vendor;
//   3. There are no local tokens released as yet for the territory in question.
//
pragma solidity  ^0.4.24;

import { Constants, Token, LocalToken } from "./LocalToken.sol";
import { IPure } from "./ipure.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Payment is Constants {
    using SafeMath for uint256;

    address public vendor;
    address public evangelist;
    bool public payTax;
    LocalToken public localToken;
    address public govtAccount;
    address public pmtAccount;
    uint public pmtShare;
    uint public feeRate;
    uint public taxRate;
    uint public priceFactor;

    Token paymentCenter;

    // This event should always emit because it is necessary for getting everybody paid in PUR.
    event PaymentConfirmed(address _customerAddr, address _xactionFee, uint _ethValue);

    modifier precondition(bool _condition) {
        require(_condition, "precondition not met");
        _;
    }

    // Constructor
    // Evangelist must first approve single local token for this contract.
    // RSTI should run this constructor.
    constructor(
        bool _payTax,
        address _evangelist,
        address _localToken,
        address _vendor,
        address _pmntcenter) public // _pmntcenter is address of RSTI ROKS ERC20 contract
        precondition(_evangelist != 0)
        precondition(_localToken != 0)
        precondition(_vendor != 0)
    {
        localToken = LocalToken(_localToken);
        require(localToken.allowance(_evangelist, msg.sender) >= WAD, "evangelist must have already approved local tokens for vendor");
        require(localToken.balanceOf(_evangelist) >= WAD, "evangelist must already be licensed for this vendor");
        feeRate = localToken.universalToken().xactionFeeNumerator();
        taxRate = localToken.taxRateNumerator();
        priceFactor = DENOMINATOR.add(_payTax ? taxRate : 0).add(feeRate);
        govtAccount = localToken.govtAccount();
        // do the following externally after constructor execution
        //localToken.transferFrom(_evangelist, address(this), WAD);
        vendor = _vendor;
        evangelist = _evangelist;
        payTax = _payTax;
        IPure _pure = IPure(_pmntcenter);
        _pure.registerVendor(address(this));
        paymentCenter = Token(_pmntcenter);
    }

    // Transfer this vendor to another evangelist.
    // Acquiring evangelist must first approve at least single local token for source vendor.
    function transferThisVendor(address toAnotherEvangelist) public
        precondition(msg.sender == evangelist)
    {
        if (localToken.transferFrom(toAnotherEvangelist, evangelist, WAD))
            evangelist = toAnotherEvangelist;
    }

    function setPayTax(bool pay) public
        precondition(msg.sender == vendor)
    {
        payTax = pay;
    }

    // Refresh all parameters for calculating transaction fee and taxes.
    // This allows these parameters to be modified in a single place.
    // This refresh routine cost is charged to the evangelist or vendor, but it needs to be done
    // only once a month.
    function refreshFeeParams() public
        precondition(msg.sender == vendor || msg.sender == evangelist)
    {
        feeRate = localToken.universalToken().xactionFeeNumerator();
        pmtShare = localToken.universalToken().xactionFeeShare();
        taxRate = localToken.taxRateNumerator();
        priceFactor = DENOMINATOR.add(payTax ? taxRate : 0).add(feeRate);
        govtAccount = localToken.govtAccount();
        pmtAccount = localToken.pmtAccount();
    }

    // Payment function (in ethers)
    // This is triggered when customer's payment from her wallet is received by network.
    function() public
        precondition(msg.value > 1000 wei)
        precondition(vendor != msg.sender)
        payable
    {
        pmtAccount.transfer(msg.value); // all ethers are deposited with Pure Money

        emit PaymentConfirmed(msg.sender, address(this), msg.value); // emit payment event for matching with payInRSTK below

        // Call payInRSTK() from API server - can't call from here because we don't know PUR amount
    }

    // Note that transaction fee is calculated against net to vendor, and not against raw roks amount.
    // This means that the MainSale POS App must have already added all fees to roks amount.
    // Pay in ROKS - called from API Server
    function payInRSTK(uint roks)
        public
        precondition(roks > 1000)
        precondition(paymentCenter.balanceOf(paymentCenter.owner()) > 0)
    {
        uint xactionFee;
        uint salesTax;

        uint netToVendor = roks.mul(DENOMINATOR) / priceFactor;
        if (payTax && taxRate > 0) {
            xactionFee = netToVendor.mul(feeRate) / DENOMINATOR;
            salesTax = roks.sub(netToVendor).sub(xactionFee);
            paymentCenter.transfer(govtAccount, salesTax);
        } else {
            xactionFee = roks.sub(netToVendor);
        }
        paymentCenter.transfer(vendor, netToVendor);
        uint share = xactionFee.mul(pmtShare) / DENOMINATOR;
        paymentCenter.transfer(pmtAccount, share);
        paymentCenter.transfer(evangelist, xactionFee.sub(share));
    }
}
