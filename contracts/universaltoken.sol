pragma solidity  ^0.4.24;

import { IERC20, Constants, Token } from "./token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


// Universal Token
contract UniversalToken is Token {
    using SafeMath for uint256;

    uint public xactionFeeNumerator;
    uint public xactionFeeShare;

    constructor( 
        uint initialSupply,
        uint feeMult,
        uint feeShare
        )
          public
          Token(msg.sender, initialSupply)
    {
        require(initialSupply > 1000, "initial supply must be greater than 1000");
        require(feeMult > 0, "fee multiplier must be non-zero");
        symbol = "UETR";
        name = "Universal Evangelist Token - by Rock Stable Token Inc";
        decimals = DECIMALS;
        super._mint(super.owner(), initialSupply.mul(WAD));
        xactionFeeNumerator = feeMult;
        xactionFeeShare = feeShare;
    }

    function modifyTransFee(uint _xactionFeeMult) public
        onlyOwner
    {
        require(_xactionFeeMult >= 0, 'cannot modify transaction fee to less than zero');
        require(DENOMINATOR > _xactionFeeMult.mul(4), 'cannot modify transaction fee to more than 0.25');
        xactionFeeNumerator = _xactionFeeMult;
    }

    function modifyFeeShare(uint _share) public
        onlyOwner
    {
        require(_share >= 0, 'RSTI share must be zero or more');
        require(DENOMINATOR > _share.mul(3), 'RSTI share must be less than one-third');
        xactionFeeShare = _share;
    }
}
