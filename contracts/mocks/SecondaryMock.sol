pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract SecondaryMock is Secondary {
  function onlyPrimaryMock() public view onlyPrimary {
  }
}
