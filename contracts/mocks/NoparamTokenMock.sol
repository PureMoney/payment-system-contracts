pragma solidity ^0.4.24;

import "../token.sol";

contract NoparamTokenMock is Token {

  constructor()
      public
      Token(msg.sender, 200 * WAD)
  {
    if (!super.isMinter(msg.sender)) super.addMinter(msg.sender);
    if (!super.isDepot(msg.sender)) super.addDepot(msg.sender);
    super.mint(msg.sender, 100 * WAD);
  }
}
