pragma solidity ^0.6.4;

contract burnAddress {
    // Payment function (in ethers)
    // This is triggered when customer's payment from her wallet is received by network.
    // If any token is received, it cannot be retrieved.
    function bounce() public payable {
        // this contract will only keep ROKS
        // if ETH is received instead, let's be nice and return
        uint returnValue = msg.value - 100000000000;
        msg.sender.transfer(returnValue);
    }
 }
