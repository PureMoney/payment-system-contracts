pragma solidity ^0.4.24;

import "../universaltoken.sol";

contract CappedUniversalTokenMock is UniversalToken {

  constructor(uint initialAmount)
      public
      UniversalToken(initialAmount, 100, 3000)
  {
  }

}
