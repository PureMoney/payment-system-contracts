const LocalToken = artifacts.require('LocalToken');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;
const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();
const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const tokenContracts = [
  '0x0690ab8c493a9d70a2ca4efff3bc9f4b63b4eb74',
  '0x1296476fed9a62882d6ca79cbac5224aa2d3c340',
  '0x22aa1062d63b3d9ea0ce15dec72ab114dfae80e6',
  '0x32a8434470195a0045b43f61d4e1a3771334c9ec',
  '0x5d20a571481444f1dddca95a5a975c4d74450e99',
  '0x61868d6c15df0f57f8d5d6594d269f73fab06286',
  '0x875858d517d0539396d1bfb8c432e5f0d8af74d7',
  '0x9065847e1f07fc5202b21a2bce15ca505494f937',
  '0xa1e69994d0d67f5e92cca52e41490facfe4e1fbd',
  '0xde33680b4b0acf26f52cfc6c319732426985bf03',
  '0x01295d4cc649f8fb61fadb5a39c80fb25988bfaa',
  '0xed2149531db338edf960c5c0541c2931d50bc714',
  '0xe97bd0cfd004223111d38764c61b02e1e37c06d5'
];

let lToken = null;
let cap = new BigNumber(0);

const ModifyTokenContract = function(address, callback) {
  LocalToken.at(address.toLowerCase())
  .then((result, error) => {
    if (result) {
      lToken = result;
      console.log('lToken set');
      return lToken.pmtAccount.call();
    }
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('current pmt account = ', result);
      return lToken.addDepot(pmtAccount, { from: owner, gas: new BigNumber(320000) });
    }
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('added proposed pmtAccount as depot');
      return lToken.cap.call();
    }
    console.log('add depot failed');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      cap = result;
      console.log('cap = ', result);
      return lToken.totalSupply();
    }
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('total supply = ', result);
      let one = new BigNumber(10**18);
      let big = cap.minus(one).minus(result);
      console.log('big = ', big);
      if (big.gt(one)) {
        console.log('mint amount oK');
        return lToken.mint(pmtAccount, big, { from: owner, gas: new BigNumber(420000) });
      }
      callback('mint request > cap');
    }
    console.log('cap bad result, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('minting OK, result = ', result);
      return lToken.balanceOf(pmtAccount);
    }
    console.log('minting failed, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('balance = ', result);
      return lToken.modifyPMTAccount(pmtAccount, { from: owner, gas: new BigNumber(420000)});
    }
    console.log('balance failed:');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('Done');
      console.log(result);
      callback();
    }
  })
  .catch((exc) => {
    callback(exc);
  });
}

module.exports = function(callback) {
  ModifyTokenContract(tokenContracts[11], callback);
}