/// token.sol - base class for all Rock Stable tokens

// Copyright (C) 2018, 2019 Rock Stable Token Inc

// This is based on OpenZeppelin code.
// You may not use this file except in compliance with the MIT License.

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).

pragma solidity ^0.4.24;

import { CapperRole } from "openzeppelin-solidity/contracts/access/roles/CapperRole.sol";
import { IERC20 } from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import { ERC20Capped } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import { ERC20Pausable } from "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import { Ownable } from "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import { Token } from "./token.sol";

contract RSTIShares is Token {

    modifier condition(bool _condition) {
        require(_condition, "condition not met");
        _;
    }

    constructor(address _owner, uint256 _initialCap)
        public
        condition(_initialCap > 0)
        condition(_owner != address(0))
        Token(_owner, _initialCap)
    {
        symbol = "MONY";
        name = "Rockstable Token Inc Shares";
        decimals = DECIMALS;
    }
}
