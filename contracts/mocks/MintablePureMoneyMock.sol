pragma solidity ^0.4.24;

import "../puremoney.sol";
import "./MinterRoleMock.sol";

contract MintablePureMoneyMock is MinterRoleMock, PureMoney {

  constructor(address initialAccount, uint256 initialCap)
      public
      PureMoney(initialCap)
  {
    super.transferOwnership(initialAccount);
    super.addMinter(initialAccount);
  }

}
