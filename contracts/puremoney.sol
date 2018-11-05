// Pure Money Token
// This is where all Rock Stable Token ether payments go.

pragma solidity ^0.4.24;

import { Token } from "./token.sol";
import { IPayment } from "./IPayment.sol";

contract PureMoney is Token {

    mapping(address => bool) internal vendorContracts;

    event DebugEvent(address from, address to, uint value);

    // Payment contract registered
    event PaymentContractRegistered(address _contract);

    constructor( 
        uint initialCap)
          public
          condition(initialCap > 0)
          Token(msg.sender, initialCap)
    {
        symbol = "ROKS";
        name = "Rock Stable Token";
        decimals = DECIMALS;
    }

    // Register Vendor
    // Call this from API server, right after creating a Payment contract.
    // Deposit local token to payment contract.
    // An contract that is deregistered cannot be re-registered.
    //
    function registerVendor(address _contract)
        public
        onlyOwner
    {
        require(_contract != address(0), 'null contract address');
        // address source = msg.sender;
        // emit DebugEvent(address(_contract), source, 0);
        IPayment pmnt = IPayment(_contract); // reverts if _contract is not a Payment
        require(pmnt.getVendor() != address(0), 'vendor not set in payment contract');
        require(pmnt.getPmtAccount() != address(0), 'RSTI account not set in payment contract');
        pmnt.depositLocalToken();
        vendorContracts[_contract] = true;
        // emit DebugEvent(pmnt.getVendor(), source, 0);
        emit PaymentContractRegistered(_contract);
    }

    // Deregister a vendor.
    // Vendor's Payment contract will be destroyed and cnnot be revived.
    // If input address is not a Payment contract address, nothing happens.
    // NOTE: Use this with care, only if absolutely necessary. We don't want too many deregistered
    // Payment contracts lying around because if ROKS payment is made to such contracts, the payment
    // is accumulated but can never be taken out.
    //
    function deregisterVendor(address _contract)
        public
        onlyOwner
    {
        require(_contract != address(0), 'null contract address');
        require(vendorContracts[_contract] == true, 'cannot deregister an unregistered contract');
        IPayment pmnt = IPayment(_contract); // reverts if _contract is not a Payment
        vendorContracts[_contract] = false;
        pmnt.destroy();
        emit DebugEvent(pmnt.getPmtAccount(), address(0), 0);
    }

    // determine if a payment contract is registered
    function isRegistered(address _contract)
        public
        view
        returns (bool)
    {
        return vendorContracts[_contract];
    }

    // Determine if TO address is a contract;
    // If it is a Payment contract return vendor address.
    // Otherwise, return the input TO address.
    // NOTE: If the destination is an unregistered / deregistered / destroyed Payment contract, 
    // transferred ROKS tokens are accumulated in the Payment contract itself and maybe lost forever.
    // (If the destination is an as yet unregistered Payment contract, the only way to retrieve
    // the ROKS tokens is to first register and then deregister the Payment contract.)
    //
    function getAccountIfContract(address to) internal view returns (address account)
    {
        // fail early
        require(to != address(0), 'destination address is null');
        // is it a Payment contract?
        if (vendorContracts[to]) {
            IPayment pmnt = IPayment(to);
            return pmnt.getVendor();
        } else {
            return to; // 'to' can be anything
        }
    }

    // Base function override.
    function transfer(address to, uint tokens) public returns (bool success)
    {
        return super.transfer(getAccountIfContract(to), tokens);
    }

    // Base function override.
    function transferFrom(address from, address to, uint tokens) public returns (bool success)
    {
        return super.transferFrom(from, getAccountIfContract(to), tokens);
    }

}
