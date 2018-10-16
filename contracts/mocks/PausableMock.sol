pragma solidity ^0.4.24;

import "../token.sol";
import "./PauserRoleMock.sol";

// mock class using Pausable
contract PausableMock is Token, PauserRoleMock {
  bool public drasticMeasureTaken;
  uint256 public count;

  constructor() public {
    drasticMeasureTaken = false;
    count = 0;
  }

  function normalProcess() external whenNotPaused {
    count++;
  }

  function drasticMeasure() external whenPaused {
    drasticMeasureTaken = true;
  }

}
