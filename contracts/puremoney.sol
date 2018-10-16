// Pure Money Token
// This is where all Rock Stable Token ether payments go.

pragma solidity ^0.4.24;

import { Token } from "./token.sol";
import { Payment } from "./payment.sol";
import { IPure } from "./ipure.sol";

contract PureMoney is Token, IPure {

    mapping(address => bool) internal vendorContracts;

    constructor( 
        uint initialSupply)
          public
          condition(initialSupply > 100)
          Token(msg.sender, initialSupply)
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
