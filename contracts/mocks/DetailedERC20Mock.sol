pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../token.sol";

contract ERC20DetailedMock is ERC20, Token {
  constructor(
    string _name,
    string _symbol,
    uint8 _decimals
  )
    public
  {
    name = _name;
    symbol = _symbol;
    decimals = uint(_decimals);
  }
}
