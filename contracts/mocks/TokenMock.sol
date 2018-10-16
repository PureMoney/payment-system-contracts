pragma solidity ^0.4.24;

import "../token.sol";

contract TokenMock is Token {

  constructor(address _owner, uint256 _cap)
      public
      Token(_owner, _cap.mul(2))
  {
    super.addMinter(_owner);
    super.mint(_owner, _cap);
  }
}
