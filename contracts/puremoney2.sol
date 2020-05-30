// Pure Money Token
// This is where all Rock Stable Token ether payments go.

pragma solidity ^0.4.24;

import { Token } from "./token.sol";
import { IPayment2 } from "./IPayment2.sol";
import { LocalToken } from "./LocalToken.sol";

contract PureMoney2 is Token {

    event DebugEvent(address from, address to, uint value);

    // Payment contract registered
    event PaymentContractRegistered(address _contract, uint amountApproved);

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
    // The second param is a count of how many ROKS to approve (in wei units) for the
    // payment contract to transferFrom owner.
    //
    function registerVendor(address _contract, uint amountToApprove)
        public
        onlyOwner
    {
        require(_contract != address(0), 'null contract address');
        require(!this.isRegistered(_contract), 'payment contract is already registered');
        // address source = msg.sender;
        // emit DebugEvent(address(_contract), source, 0);
        IPayment2 pmnt = IPayment2(_contract); // reverts if _contract is not a Payment
        require(pmnt.getVendor() != address(0), 'vendor not set in payment contract');
        require(pmnt.getPmtAccount() != address(0), 'RSTI account not set in payment contract');
        pmnt.depositLocalToken();
        super.approve(address(pmnt), amountToApprove);
        // emit DebugEvent(pmnt.getVendor(), source, 0);
        emit PaymentContractRegistered(_contract, amountToApprove);
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
        IPayment2 pmnt = IPayment2(_contract); // reverts if _contract is not a Payment
        pmnt.destroy();
        emit DebugEvent(pmnt.getPmtAccount(), address(0), 0);
    }

    // determine if a payment contract is registered
    function isRegistered(address _contract)
        public
        view
        returns (bool)
    {
        return (this.allowance(this.owner(), _contract) > WAD);
    }

    // Determine if TO address is a contract;
    // If it is a Payment contract return vendor address.
    // Otherwise, return the input TO address.
    // The ultimate purpose of this function is to allow direct ROKS payment to vendor address,
    // not just to vendor payment contract address.
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
        if (this.isRegistered(to)) {
            IPayment2 pmnt = IPayment2(to);
            LocalToken local = LocalToken(pmnt.getLocalToken());
            require(local.balanceOf(to) >= WAD, 'destination address is an unregistered payment contract');
            return pmnt.getVendor();
        } else {
            return to; // 'to' can be anything
        }
    }

    // Base function override.
    function transfer(address to, uint tokens) public returns (bool success)
    {
        emit DebugEvent(msg.sender, to, tokens);
        address addr = getAccountIfContract(to);
        require(addr != address(0), 'vendor address is zero');
        require(balanceOf(msg.sender) >= tokens, 'not enough tokens');
        super._transfer(msg.sender, addr, tokens);
        return true;
    }

    // Base function override.
    function transferFrom(address from, address to, uint tokens) public returns (bool success)
    {
        emit DebugEvent(from, to, tokens);
        return super.transferFrom(from, getAccountIfContract(to), tokens);
    }

}
