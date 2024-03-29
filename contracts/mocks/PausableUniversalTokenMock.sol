pragma solidity ^0.4.24;

import "../universaltoken.sol";
import "./PauserRoleMock.sol";

// mock class using ERC20Pausable
contract PausableUniversalTokenMock is UniversalToken, PauserRoleMock {

  constructor(address initialAccount, uint initialBalance)
      public
      UniversalToken(initialBalance.mul(2), 100, 3000)
  {
    if (!super.isMinter(initialAccount))
      super.mint(initialAccount, initialBalance);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
