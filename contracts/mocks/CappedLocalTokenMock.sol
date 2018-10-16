pragma solidity ^0.4.24;

import "../LocalToken.sol";

// use address of old universal token as last parameter
contract CappedLocalTokenMock is LocalToken {

  constructor(uint256 _cap, address universalToken)
      public
      LocalToken(_cap, 0, 'CLT', 'Capped Local Token', 'some place', 0, msg.sender, universalToken)
  {
  }

}
