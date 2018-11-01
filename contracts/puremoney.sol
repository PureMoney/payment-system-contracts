// Pure Money Token
// This is where all Rock Stable Token ether payments go.

pragma solidity ^0.4.24;

import { Token } from "./token.sol";
import { IPayment } from "./IPayment.sol";

contract PureMoney is Token {

    mapping(address => bool) internal vendorContracts;

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
    // Call this from Payment.sol.
    //
    function registerVendor(address _contract)
        public
        onlyOwner
    {
        require(_contract != address(0), 'null contract address');
        IPayment pmnt = IPayment(_contract); // reverts if _contract is not a Payment
        require(pmnt.getVendor() != address(0), 'vendor not set in payment contract');
        vendorContracts[_contract] = true;
    }

    // Determine if TO address is a contract;
    // If it is a Payment contract return vendor address.
    // Otherwise, return the input TO address.
    //
    function getAccountIfContract(address to) internal view returns (address account)
    {
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
