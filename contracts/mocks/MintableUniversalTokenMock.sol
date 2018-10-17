pragma solidity ^0.4.24;

import "../universaltoken.sol";
import "./MinterRoleMock.sol";

contract MintableUniversalTokenMock is MinterRoleMock, UniversalToken {

  constructor(address initialAccount, uint256 initialBalance)
      public
      UniversalToken(initialBalance.mul(2), 100, 3000)
  {
    super.transferOwnership(initialAccount);
    super.addMinter(initialAccount);
    super.mint(initialAccount, initialBalance);
  }

}
