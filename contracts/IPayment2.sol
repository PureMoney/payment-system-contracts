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

interface IPayment2 {
    // This event should always emit because it is necessary for getting everybody paid in PUR.
    event PaymentConfirmed(address indexed _customerAddr, address indexed _paymentContract, uint _ethValue, uint _roks);

    // Payment created event
    event PaymentContract(bool _payTax, address _evangelist, address _localToken, address _vendor, address _pmntCenter);

    // contract refreshed
    event PaymentContractRefreshed(address _contract);

    // Vendor transferred
    event VendorTransferred(address _fromEvangelist, address _toEvangelist);

    // temporary, for debugging only
    event DebugEvent(address from, address to, uint value);

    function getVendor() external view returns (address);

    function getPmtAccount() external view returns (address);

    // Transfer this vendor to another evangelist.
    // Acquiring evangelist must first approve at least single local token for source vendor.
    function transferThisVendor(address toAnotherEvangelist) external;

    function setPayTax(bool pay) external;

    // Refresh all parameters for calculating transaction fee and taxes.
    // This allows these parameters to be modified in a single place.
    // This refresh routine cost is charged to the evangelist or vendor, but it needs to be done
    // only once a month.
    function refreshFeeParams() external;

    function depositLocalToken() external;

    function destroy() external;

    function getEthPrice() external view returns (uint);

    function setEthPrice(uint ethPrice) external;

    function getRoksExpected() external view returns (uint);

    function setRoksExpected(uint roksExpected) external;

    function getLocalToken() external view returns (LocalToken);
}
