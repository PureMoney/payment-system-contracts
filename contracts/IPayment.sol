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

interface IPayment {
    // This event should always emit because it is necessary for getting everybody paid in PUR.
    event PaymentConfirmed(address _customerAddr, address _xactionFee, uint _ethValue);

    // Payment created event
    event PaymentContract(bool _payTax, address _evangelist, address _localToken, address _vendor, address _pmntCenter);

    // Vendor transferred
    event VendorTransferred(address _fromEvangelist, address _toEvangelist);

    // temporary, for debugging only
    event DebugEvent(uint value);

    function getVendor() external view returns (address);

    // Transfer this vendor to another evangelist.
    // Acquiring evangelist must first approve at least single local token for source vendor.
    function transferThisVendor(address toAnotherEvangelist) external;

    function setPayTax(bool pay) external;

    // Refresh all parameters for calculating transaction fee and taxes.
    // This allows these parameters to be modified in a single place.
    // This refresh routine cost is charged to the evangelist or vendor, but it needs to be done
    // only once a month.
    function refreshFeeParams() external;

    // Pay in ROKS - called from the API Server 
    // Call to this method is triggered by the PaymentConfirmed event.
    // The API Server must match the above ether payment transaction with
    // the correct sell order to determine the ROKS (USD) amount to pay the vendor.
    // Note that our transaction fee is calculated against net to vendor, and not against raw roks amount.
    // This means that the MainSale POS App must have already added all fees to roks amount.
    //
    // With regards to timing: there should be at least a few seconds from the time MainSale sends the 
    // InitiatePayment call to the API server, and the time that the customer sends the payment itself.
    // Therefore, it is likely the ETH sale has executed by the time the API server calls payInROKS.
    // Nevertheless, the API server should not wait for the trade to execute before executing this
    // transaction. All that the API server needs to know is data on the order itself, the
    // most important being how much ROKS the MainSale app requested in exchange for the payment.
    // This data is known even before the order is placed.
    //
    // NOTE: We pay for network fees when executing this transaction, not the customer.
    //
    function payInROKS(uint roks) external;

}
