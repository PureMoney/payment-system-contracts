const BigNumber = require('bn.js');

const hex2big = function(hex) {
    let number = hex;
    if (!(hex instanceof String)) {
        number = hex.toString();
    }
    assert(number.substring(0, 2) === '0x', 'hex input must start with 0x'); // must start with '0x'
    return new BigNumber(number.substring(2), 'hex');
}

module.exports = hex2big;
