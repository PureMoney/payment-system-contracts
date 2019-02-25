/// token.sol - base class for all Rock Stable tokens

// Copyright (C) 2018, 2019 Rock Stable Token Inc

// This is based on OpenZeppelin code.
// You may not use this file except in compliance with the MIT License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.24;

import { CapperRole } from "openzeppelin-solidity/contracts/access/roles/CapperRole.sol";
import { MinterRole } from "openzeppelin-solidity/contracts/access/roles/MinterRole.sol";
import { PauserRole } from "openzeppelin-solidity/contracts/access/roles/PauserRole.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { Capped } from "./Capped.sol";
import { ERC20Pausable } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Constants {
    uint public constant DENOMINATOR = 10000; // deprecated
    uint public constant DECIMALS = 18;
    uint public constant WAD = 10**DECIMALS;
}

contract Token is Constants, Ownable, ERC20Pausable, Capped {
    string  public symbol;
    uint256 public decimals;
    string  public name;

    modifier condition(bool _condition) {
      require(_condition, "condition not met");
      _;
    }

    constructor(address _owner, uint256 _cap)
        public
        Capped(_cap)
    {
      require(_owner != 0, "proposed owner is null");
      if (msg.sender != _owner) {
        super.transferOwnership(_owner);
        super.addCapper(_owner);
      }
    }

}
