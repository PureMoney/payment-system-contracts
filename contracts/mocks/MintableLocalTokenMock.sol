pragma solidity ^0.4.24;

import "../LocalToken.sol";
import "./MinterRoleMock.sol";

// use address of old universal token as last parameter
contract MintableLocalTokenMock is LocalToken, MinterRoleMock {

  constructor(address initialAccount, uint256 initialCap)
      public
      LocalToken(initialCap, 0, 'MLT', 'Mintable Local Token', 'some place', 0, initialAccount, 0x176d83550f672F67adBbfF6Dc71509730D32138b)
  {
    super.transferOwnership(initialAccount);
    super.addMinter(initialAccount);
  }

}
