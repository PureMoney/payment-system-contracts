pragma solidity ^0.4.24;

import "../puremoney2.sol";

contract CappedPureMoneyMock is PureMoney2 {

  constructor(address initialAccount, uint256 initialCap)
    public
    PureMoney2(initialCap)
  {
    if (initialAccount != super.owner()) super.transferOwnership(initialAccount);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
