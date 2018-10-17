pragma solidity ^0.4.24;

import "../puremoney.sol";
import "./PauserRoleMock.sol";

// mock class using ERC20Pausable
contract PausablePureMoneyMock is PureMoney, PauserRoleMock {

  constructor(address initialAccount, uint initialBalance)
      public
      PureMoney(initialBalance.mul(2))
  {
    super.transferOwnership(initialAccount);
    super.addPauser(initialAccount);
    super.mint(initialAccount, initialBalance);
  }

}
