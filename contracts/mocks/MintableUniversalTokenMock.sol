pragma solidity ^0.4.24;

import "../universaltoken.sol";

contract MintableUniversalTokenMock is UniversalToken {

  constructor(address initialAccount, uint256 initialBalance)
      public
      UniversalToken(initialBalance, 100, 3000)
  {
    super.transferOwnership(initialAccount);
  }

}
