pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";

/**
 * @title Depot
 * @dev Minting can only be directed to Depot accounts.
 */
contract Depot is MinterRole {

  mapping(address => bool) private _depotAddress;

  modifier onlyDepot(address depot) {
    require(_depotAddress[depot], "not a depot address");
    _;
  }

  function addDepot(address depot)
    public
    onlyMinter
  {
    _addDepot(depot);
  }

  function removeDepot(address depot)
    public
    onlyMinter
    onlyDepot(depot)
  {
    _removeDepot(depot);
  }

  /**
   * Add a depot address.
   */
  function _addDepot(address depot) internal {
    require(depot != address(0), "depot cannot be null");
    _depotAddress[depot] = true;
  }

  function _removeDepot(address depot) internal {
    _depotAddress[depot] = false;
  }

}
