pragma solidity ^0.4.24;

import "../LocalToken.sol";
import "./MinterRoleMock.sol";

// use address of old universal token as last parameter
contract MintableLocalTokenMock is MinterRoleMock, LocalToken {

  constructor(address initialAccount, uint256 initialCap, address uAddr)
      public
      LocalToken(initialCap, 0, 'MLT', 'Mintable Local Token', 'some place', 0, initialAccount, uAddr)
  {
    // super.transferOwnership(initialAccount);
    // super.addMinter(initialAccount);
  }

  function mint(address to, uint256 amount) public returns (bool) {
    super.addDepot(to);
    super.mint(to, amount);
  }

}
