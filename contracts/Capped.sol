pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
// import "openzeppelin-solidity/contracts/access/roles/CapperRole.sol";
import "./depot.sol";

/**
 * @title Capped token - also, limit minting targets to depots.
 * @dev Mintable token with a token cap.
 */
contract Capped is Depot, ERC20Mintable {

  uint256 private _cap;

  constructor(uint256 cap)
    public
  {
    require(cap > 0, 'Cap cannot be zero');
    _cap = cap;
  }

  /**
   * @return the cap for the token minting.
   */
  function cap() public view returns(uint256) {
    return _cap;
  }

  function setCap(uint256 newCap)
    public
    onlyCapper
  {
    _setCap(newCap);
  }

  /**
   * Cap cannot be reduced, can only be increased.
   */
  function _setCap(uint256 newCap) internal {
    if (newCap > _cap) _cap = newCap;
  }

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param value The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(
    address to,
    uint256 value
  )
    public
    onlyMinter
    onlyDepot(to)
    returns (bool)
  {
    require(totalSupply().add(value) <= _cap, "mint value limit exceeded");

    return super.mint(to, value);
  }

}
