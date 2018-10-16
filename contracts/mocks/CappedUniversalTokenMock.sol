pragma solidity ^0.4.24;

import "../universaltoken.sol";

contract CappedUniversalTokenMock is UniversalToken {

  constructor(uint initialCap)
      public
      UniversalToken(initialCap, 100, 3000)
  {
  }

}
