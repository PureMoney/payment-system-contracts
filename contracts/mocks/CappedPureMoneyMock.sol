pragma solidity ^0.4.24;

import "../puremoney.sol";

contract CappedPureMoneyMock is PureMoney {

  constructor(address initialAccount, uint256 initialCap)
    public
    PureMoney(initialCap)
  {
    super.transferOwnership(initialAccount);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
