const LocalToken = artifacts.require('LocalToken');
const { ether } = require('../test/helpers/ether');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;
const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();
const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

module.exports = function(callback) {
  var lToken = LocalToken.at('0xe97bd0cfd004223111d38764c61b02e1e37c06d5');
  console.log('lToken set');
  //var currPmt = await lToken.pmtAccount.call();
  //console.log('current pmt account = ', currPmt);

  // await lToken.addDepot(pmtAccount, { from: owner });
  //console.log('added depot');
  //callback('stop');
  lToken.cap.call()
  .then((result, error) => {
    if (result) {
      console.log('cap = ', result);
      let big = new BigNumber(700000 * 10**18);
      console.log('big = ', big);
      if (result.gt(big)) {
        console.log('mint amount oK');
        return lToken.mint(pmtAccount, big, { from: owner, gas: new BigNumber(420000) });
      }
      callback('mint request > cap');
    }
    console.log('mint amount null, error = ', error);
    callback('error');
  })
  .then((result, error) => {
    if (result) {
      console.log('minting OK, result = ', result);
      return lToken.balanceOf(pmtAccount);
    }
    callback('minting failed, error = ', error);
  })
  .then((result, error) => {
    if (result) {
      console.log('balance = ', result);
      return lToken.modifyPMTAccount(pmtAccount, { from: owner, gas: new BigNumber(420000)});
    }
    callback('balance failed = ', error);
  })
  .then((result, error) => {
    if (result) {
      console.log('success, result = ', result);
    } else {
      callback(error);
    }
  })
  .catch((exc) => {
    callback(exc);
  });
}
