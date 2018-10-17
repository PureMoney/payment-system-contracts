pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/roles/CapperRole.sol";

/**
 * @title Depot
 * @dev Minting can only be directed to Depot accounts.
 */
contract Depot is CapperRole {

  mapping(address => bool) private _depotAddress;

  modifier onlyDepot(address depot) {
    require(_depotAddress[depot], "not a depot address");
    _;
  }

  function addDepot(address depot)
    public
    onlyCapper
  {
    _addDepot(depot);
  }

  function removeDepot(address depot)
    public
    onlyCapper
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
