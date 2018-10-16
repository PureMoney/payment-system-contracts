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
            condition(_maxTokens > 10)
            condition(DENOMINATOR > _taxRateMult.mul(2))
            condition((_taxRateMult > 0 && _govt != 0) || _taxRateMult == 0)
            condition(_universalToken != 0)
            Token(_pmt, _maxTokens)
    {
        // universalToken = UniversalToken(_universalToken);
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

    function modifyLocality(string newLocality) public
        onlyOwner
    {
        localityCode = newLocality;
    }

    function modifyTaxRate(uint _taxMult) public
        onlyOwner
        condition(DENOMINATOR > 2 * _taxMult)
    {
        taxRateNumerator = _taxMult;
    }

    // To reset gvtAccount when taxRateNumerator is not zero, 
    // must reset taxRateNumerator first.
    // To set govtAccount when taxRateNumerator is zero,
    // must set taxRateNumerator first to non-zero value.
    function modifyGovtAccount(address govt) public
        onlyOwner
        condition((taxRateNumerator > 0 && govt != 0) ||
                (taxRateNumerator == 0 && govt == 0))
    {
        govtAccount = govt;
    }

    function modifyPMTAccount(address _pmt) public
        onlyOwner
    {
        pmtAccount = _pmt;
    }
}
