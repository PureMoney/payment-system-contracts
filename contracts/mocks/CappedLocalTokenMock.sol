pragma solidity ^0.4.24;

import "../LocalToken.sol";
import "./CapperRoleMock.sol";

// use address of old universal token as last parameter
contract CappedLocalTokenMock is LocalToken, CapperRoleMock {

  constructor(uint256 _cap)
      public
      LocalToken(_cap, 0, 'CLT', 'Capped Local Token', 'some place', 0, msg.sender, 0x176d83550f672F67adBbfF6Dc71509730D32138b)
  {
  }

}
