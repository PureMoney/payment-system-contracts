// An instance of this contract is created for every vendor. It's a "Forwarding Contract".
// The constructor is run during POS registration, and it helps in enforcing locality of evangelist.
// Enforcement of locality is done during POS registration. However, enforcement is done in the central server,
// with help from these three smart contracts. The POS installation will fail for any of the following reasons:
//   1. The evangelist doing the installation does not own local tokens;
//   2. The local tokens owned by the evangelist do not match the political territory of the vendor;
//   3. There are no local tokens released as yet for the territory in question.
//
pragma solidity  ^0.4.24;

import { Constants, LocalToken } from "./LocalToken.sol";
import { IPayment2 } from "./IPayment2.sol";
import { PureMoney } from "./puremoney.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Payment2 is Constants, IPayment2 {
    using SafeMath for uint256;
    using SafeMath for uint;

    address public evangelist;
    bool public payTax;
    LocalToken public localToken;
    address public govtAccount;
    address public pmtAccount;
    uint public pmtShare;
    uint public feeRate;
    uint public taxRate;
    uint public txFeeFactor;
    uint public ethPrice; // divide by Constants.DENOMINATOR to get price

    address private vendor;

    PureMoney paymentCenter;

    modifier precondition(bool _condition) {
        require(_condition, "precondition not met");
        _;
    }

    modifier onlyPureMoney() {
        require(msg.sender == address(paymentCenter), "can only be called from PureMoney (ROKS) contract");
        _;
    }

    // Constructor
    // Evangelist must approve single local token for this contract right after its creation.
    // RSTI should run this constructor.
    // NOTE: If the evangelist is RSTI itself, which would be the case if the vendor self-registered,
    // then RSTI must approve a single local token right after this contructor execution
    // and this constructor should be called with _evangelist = localToken.pmtAccount().
    //
    constructor(
        bool _payTax,
        address _evangelist,
        address _localToken,
        address _vendor,
        address _pmntcenter) public // _pmntcenter is address of RSTI ROKS ERC20 contract
        precondition(_evangelist != address(0))
        precondition(_localToken != address(0))
        precondition(_vendor != address(0))
        precondition(_vendor != _evangelist)
    {
        localToken = LocalToken(_localToken);
        require(localToken.balanceOf(_evangelist) >= WAD, "evangelist must already be licensed for this vendor");
        feeRate = localToken.universalToken().xactionFeeNumerator();
        pmtShare = localToken.universalToken().xactionFeeShare();
        taxRate = localToken.taxRateNumerator();
        txFeeFactor = DENOMINATOR.add(_payTax ? taxRate : 0).add(feeRate);
        govtAccount = localToken.govtAccount();
        pmtAccount = localToken.pmtAccount();
        vendor = _vendor;
        evangelist = _evangelist;
        payTax = _payTax;
        paymentCenter = PureMoney(_pmntcenter);
        ethPrice = 10000; // just a number, any number
        emit PaymentContract(_payTax, _evangelist, _localToken, _vendor, _pmntcenter);
    }

    function getVendor() public view returns (address)
    {
        return vendor;
    }

    function getPmtAccount() public view returns (address)
    {
        return pmtAccount;
    }

    // Transfer this vendor to another evangelist.
    // Acquiring evangelist must first approve at least single local token for source vendor.
    function transferThisVendor(address toAnotherEvangelist) public
        precondition(msg.sender == evangelist)
        precondition(toAnotherEvangelist != evangelist)
    {
        if (localToken.transferFrom(toAnotherEvangelist, evangelist, WAD))
        {
            evangelist = toAnotherEvangelist;
            emit VendorTransferred(msg.sender, toAnotherEvangelist);
        }
    }

    // Turn ON or OFF payment of taxes.
    // Can be done only by vendor.
    // NOTE: If the payment tax rate is zero, this setting won't matter; no tax is paid either way.
    function setPayTax(bool pay) public
        precondition(msg.sender == vendor)
    {
        payTax = pay;
    }

    // Refresh all parameters for calculating transaction fee and taxes.
    // This allows these parameters to be modified in a single place.
    // This refresh routine cost is charged to the evangelist or vendor, but it needs to be done
    // at most only once a month.
    function refreshFeeParams() public
        precondition(msg.sender == vendor || msg.sender == evangelist)
    {
        feeRate = localToken.universalToken().xactionFeeNumerator();
        pmtShare = localToken.universalToken().xactionFeeShare();
        taxRate = localToken.taxRateNumerator();
        txFeeFactor = DENOMINATOR.add(payTax ? taxRate : 0).add(feeRate);
        govtAccount = localToken.govtAccount();
        pmtAccount = localToken.pmtAccount();
        emit PaymentContractRefreshed(address(this));
    }

    // Need to deposit local token to this contract during
    // registration. This can only be called from PureMoney, so can't
    // test it independently.
    function depositLocalToken() public onlyPureMoney
    {
        // the statement below needs the evangelist to approve 1 local token, with this contract as spender;
        // the token is deposited also in this payment contract.
        localToken.transferFrom(evangelist, address(this), WAD);
    }

    // Deregistering this Payment contract from PureMoney means killing it.
    // This can only be called from PureMoney, so can't test it independently.
    function destroy() public onlyPureMoney {
        // return license to evangelist (this contract currently owns the license token)
        localToken.transfer(evangelist, localToken.balanceOf(address(this)));

        // disable ether payments by resetting pmtAccount, etc
        // any ethers owned by this contract is given to evangelist (why not to vendor?)
        address beneficiary = evangelist;
        evangelist = address(0);
        // localToken = LocalToken(0);
        // paymentCenter = PureMoney(0);
        vendor = address(0);
        pmtAccount = address(0);
        selfdestruct(beneficiary);
    }

    // Pay in ROKS - called from default payable method below.
    // The API Server must modify the ethPrice before the customer makes a payment.
    // The payable method uses ethPrice to determine the ROKS (USD) amount to pay the vendor.
    // Note that our transaction fee is calculated against net to vendor, and not against raw roks amount.
    // This means that the MainSale POS App must have already added all fees to roks amount.
    // If the customer adds a tip, this contract cannot distinguish between the tip + net and
    // the net amount, so it will calculate the portions for different actors using tip + net (not net).
    //
    // With regards to timing: there should be at least a few seconds from the time MainSale sends the 
    // InitiatePayment call to the API server, and the time that the customer sends the payment itself.
    // The payable method gets called only upon payment by customer, which then calls payInROKS.
    // The payable method also emits the PaymentConfirmed event, which the API waits for for every
    // InitiatePayment call. The API server places a maker order for every PaymentConfirmed event.
    //
    function payInROKS(uint roks) private
        precondition(roks > 0)
        precondition(owner != pmtAccount)
        precondition(roks <= paymentCenter.allowance(paymentCenter.owner(), address(this)))
    {
        uint xactionFee;
        uint salesTax;

        uint netToVendor = roks.mul(DENOMINATOR).div(txFeeFactor);
        address owner = paymentCenter.owner();
        if (payTax && taxRate > 0) {
            xactionFee = netToVendor.mul(feeRate).div(DENOMINATOR);
            salesTax = roks.sub(netToVendor).sub(xactionFee);
            paymentCenter.transferFrom(owner, govtAccount, salesTax);
        } else {
            xactionFee = roks.sub(netToVendor);
        }
        paymentCenter.transferFrom(owner, vendor, netToVendor);
        uint share = xactionFee.mul(pmtShare).div(DENOMINATOR);
        paymentCenter.transferFrom(owner, pmtAccount, share);
        paymentCenter.transferFrom(owner, evangelist, xactionFee.sub(share));
        emit DebugEvent(owner, pmtAccount, share);
    }

    // Payment function (in ethers)
    // This is triggered when customer's payment from her wallet is received by network.
    function() public
        precondition(msg.value > 0 wei)
        precondition(vendor != msg.sender)
        payable
    {
        require(paymentCenter.isRegistered(address(this)), 'Payment contract must be registered');

        // make sure pmtAccount is set
        require(pmtAccount != address(0), 'Payment contract is not initialized');

        // all ethers are deposited in Pure Money account
        pmtAccount.transfer(msg.value);

        uint roks = msg.value.mul(ethPrice).div(DENOMINATOR);
        address source = msg.sender;
        emit PaymentConfirmed(source, address(this), msg.value, roks);

        payInROKS(roks);
    }
}
