pragma solidity ^0.4.24;

import "../token.sol";

contract NoparamTokenMock is Token {

  constructor()
      public
      Token(msg.sender, 200)
  {
    super.addMinter(msg.sender);
    super.mint(msg.sender, 100);
  }
}
