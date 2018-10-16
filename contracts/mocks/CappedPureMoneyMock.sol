pragma solidity ^0.4.24;

import "../puremoney.sol";

contract CappedPureMoneyMock is PureMoney {

  constructor(address initialAccount, uint256 initialBalance)
    public
    PureMoney(initialBalance)
  {
    super.transferOwnership(initialAccount);
  }

}
