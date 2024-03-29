pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "../token.sol";

contract ERC20FailingMock is Token {
  constructor(address _owner, uint256 _supply)
    public
    Token(_owner, _supply)
  {
  }

  function totalSupply() public view returns (uint256) {
    return 0;
  }

  function transfer(address, uint256) public returns (bool) {
    return false;
  }

  function transferFrom(address, address, uint256) public returns (bool) {
    return false;
  }

  function approve(address, uint256) public returns (bool) {
    return false;
  }

  function balanceOf(address) public view returns (uint256) {
    return 0;
  }

  function allowance(address, address) public view returns (uint256) {
    return 0;
  }
}

contract ERC20SucceedingMock is Token {
  constructor(address _owner, uint256 _supply)
    public
    Token(_owner, _supply)
  {
  }

  function totalSupply() public view returns (uint256) {
    return 0;
  }

  function transfer(address, uint256) public returns (bool) {
    return true;
  }

  function transferFrom(address, address, uint256) public returns (bool) {
    return true;
  }

  function approve(address, uint256) public returns (bool) {
    return true;
  }

  function balanceOf(address) public view returns (uint256) {
    return 0;
  }

  function allowance(address, address) public view returns (uint256) {
    return 0;
  }
}

contract SafeERC20Helper {
  using SafeERC20 for IERC20;

  IERC20 private _failing;
  IERC20 private _succeeding;

  constructor() public {
    _failing = new ERC20FailingMock(msg.sender, 1000000);
    _succeeding = new ERC20SucceedingMock(msg.sender, 1000000);
  }

  function doFailingTransfer() public {
    _failing.safeTransfer(address(0), 0);
  }

  function doFailingTransferFrom() public {
    _failing.safeTransferFrom(address(0), address(0), 0);
  }

  function doFailingApprove() public {
    _failing.safeApprove(address(0), 0);
  }

  function doSucceedingTransfer() public {
    _succeeding.safeTransfer(address(0), 0);
  }

  function doSucceedingTransferFrom() public {
    _succeeding.safeTransferFrom(address(0), address(0), 0);
  }

  function doSucceedingApprove() public {
    _succeeding.safeApprove(address(0), 0);
  }
}
