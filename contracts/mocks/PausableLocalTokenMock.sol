pragma solidity ^0.4.24;

import "../LocalToken.sol";
import "../mocks/PauserRoleMock.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// use address of old universal token as last parameter
contract PausableLocalTokenMock is LocalToken, PauserRoleMock {
  using SafeMath for uint256;

  constructor(address initialAccount, uint256 initialBalance)
      public
      LocalToken(initialBalance.mul(2), 0, 'PLT', 'Pausable Local Token', 'some place', 0, initialAccount, 0x176d83550f672F67adBbfF6Dc71509730D32138b)
  {
    super.transferOwnership(initialAccount);
    super.mint(initialAccount, initialBalance);
  }

}
