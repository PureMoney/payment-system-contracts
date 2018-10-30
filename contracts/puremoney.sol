// Pure Money Token
// This is where all Rock Stable Token ether payments go.

pragma solidity ^0.4.24;

import { Token } from "./token.sol";
import { Payment } from "./payment.sol";

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
        Payment pmnt = Payment(_contract);
        require(pmnt != address(0), 'not a payment contract');
        require(pmnt.vendor() != address(0), 'vendor not set in payment contract');
        vendorContracts[_contract] = true;
    }

    // Determine if TO address is a contract;
    // If it is a Payment contract return vendor address.
    // Otherwise, return the input TO address.
    //
    function getAccountIfContract(address to) internal view returns (address account)
    {
        // is it a Payment contract?
        if (vendorContracts[to])
        {
            Payment pmnt = Payment(to);
            return pmnt.vendor();
        }
        else
        {
            return to;
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
