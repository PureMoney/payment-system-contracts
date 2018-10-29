pragma solidity ^0.4.24;

import "../LocalToken.sol";
import "../mocks/PauserRoleMock.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// use address of old universal token as last parameter
contract PausableLocalTokenMock is LocalToken, PauserRoleMock {
  using SafeMath for uint256;

  constructor(address initialAccount, uint256 initialBalance, address uniAddr)
      public
      LocalToken(initialBalance.mul(2), 0, 'PLT', 'Pausable Local Token', 'some place', 0, initialAccount, uniAddr)
  {
    super.transferOwnership(initialAccount);
    super.addDepot(initialAccount);
    super.mint(initialAccount, initialBalance);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
