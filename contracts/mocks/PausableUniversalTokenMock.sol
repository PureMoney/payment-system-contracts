pragma solidity ^0.4.24;

import "../universaltoken.sol";
import "./PauserRoleMock.sol";

// mock class using ERC20Pausable
contract PausableUniversalTokenMock is UniversalToken, PauserRoleMock {

  constructor(address initialAccount, uint initialBalance)
      public
      UniversalToken(initialBalance.mul(2), 100, 3000)
  {
    super.transferOwnership(initialAccount);
    super.addDepot(initialAccount);
    super.mint(initialAccount, initialBalance);
    super.addPauser(initialAccount);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
