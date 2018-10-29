pragma solidity ^0.4.24;

import "../puremoney.sol";
import "./PauserRoleMock.sol";

// mock class using ERC20Pausable
contract PausablePureMoneyMock is PureMoney, PauserRoleMock {

  constructor(address initialAccount, uint initialBalance)
      public
      PureMoney(initialBalance.mul(2))
  {
    if (initialAccount != msg.sender) {
      super.transferOwnership(initialAccount);
      super.addPauser(initialAccount);
      super.addDepot(initialAccount);
      super.mint(initialAccount, initialBalance);
    }
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
