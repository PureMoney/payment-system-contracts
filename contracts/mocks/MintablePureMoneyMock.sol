pragma solidity ^0.4.24;

import "../puremoney2.sol";
import "./MinterRoleMock.sol";

contract MintablePureMoneyMock is MinterRoleMock, PureMoney2 {

  constructor(address initialAccount, uint256 initialCap)
      public
      PureMoney2(initialCap)
  {
    if (!super.isMinter(initialAccount))
      super.addMinter(initialAccount);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
