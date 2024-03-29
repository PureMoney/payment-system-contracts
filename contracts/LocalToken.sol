// LocalToken - the purpose of this token is to setup territories for evangelists to operate in.
// Each LocalToken is a territory.
//
pragma solidity  ^0.4.24;

import { IERC20, Constants, Token, UniversalToken } from "./universaltoken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// Local Token
contract LocalToken is Token {
    using SafeMath for uint256;

    string  public localityCode;
    uint    public taxRateNumerator = 0;
    address public govtAccount = 0;
    address public pmtAccount = 0;
    UniversalToken public universalToken;

    constructor(
            uint _maxTokens,
            uint _taxRateMult,
            string _tokenSymbol,
            string _tokenName,
            string _localityCode,
            address _govt,
            address _pmt,
            address _universalToken
            )
            public
            condition(_maxTokens > 0)
            condition(DENOMINATOR > _taxRateMult.mul(2))
            condition((_taxRateMult > 0 && _govt != 0) || _taxRateMult == 0)
            condition(_universalToken != 0)
            Token(msg.sender, _maxTokens)
    {
        universalToken = UniversalToken(_universalToken);
        // require(msg.sender == universalToken.owner(), "owner must be the same owner for UniversalToken");
        decimals = DECIMALS;
        symbol = _tokenSymbol;
        name = _tokenName;
        localityCode = _localityCode;
        govtAccount = _govt;
        pmtAccount = _pmt;
        if (_taxRateMult > 0) {
            taxRateNumerator = _taxRateMult;
        }
    }

    // Modify Territory
    // This should only be used when the name of the territory that covers the same
    // area changes in Bing maps.
    // The location of the territory itself should not be modified; in other words,
    // a local token, once created, has a fixed territory.
    function modifyLocality(string newLocality) public
        onlyMinter
    {
        localityCode = newLocality;
    }

    function modifyTaxRate(uint _taxMult) public
        onlyMinter
        condition(DENOMINATOR > _taxMult.mul(2))
    {
        taxRateNumerator = _taxMult;
    }

    // To reset govtAccount when taxRateNumerator is not zero, 
    // must reset taxRateNumerator first.
    // To set govtAccount when taxRateNumerator is zero,
    // must set taxRateNumerator first to non-zero value.
    function modifyGovtAccount(address govt) public
        onlyMinter
    {
        if ((taxRateNumerator > 0 && govt == address(0)) 
            || (taxRateNumerator == 0 && govt != address(0))) revert('invalid input');
        govtAccount = govt;
    }

    function modifyPMTAccount(address _pmt) public
        onlyOwner
    {
        require(_pmt != 0, 'cannot set RockStable address to zero');
        pmtAccount = _pmt;
    }
}
