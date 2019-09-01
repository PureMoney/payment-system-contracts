const PureMoneyContract = artifacts.require('PureMoney2');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;
const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();
// const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const puremoney = '0x520e91add6be97f166c4791d9e8ca4a392467c5c'; // PureMoney2 - Ropsten
// const puremoney = '0xa3c0a5899ee55ac29ee03f104cc9b85e32f4efe4'; // PureMoney2 - Ropsten
// const puremoney = '0x0fe5365119ba56f8f90d43c3dd724fac7c728013'; // Ropsten

let ROKS = null;
let cap = new BigNumber(0);

const _mintROKS = function(callback) {
  PureMoneyContract.at(puremoney.toLowerCase())
  .then((result, error) => {
    if (result) {
      ROKS = result;
      console.log('ROKS set');
      return ROKS.owner.call();
    }
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      var actualOwner = result;
      if (actualOwner !== owner) {
        console.log("actual owner = ", actualOwner);
        callback();
      };
      return ROKS.isDepot.call(owner);
    };
    callback(error);
  })
  .then((result, error) => {
    if (error) {
      callback(error);
    };
    if (result) {
      console.log('Owner is already a depot');
      return Promise.resolve(true);
    };
    return ROKS.addDepot(owner, { from: owner, gas: new BigNumber(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as depot');
      return ROKS.isMinter.call(owner);
    };
    callback(error);
  })
  .then((result, error) => {
    if (error) {
      callback(error);
    };
    if (result) {
      console.log("owner is already a minter");
      return Promise.resolve(true);
    };
    return ROKS.addMinter(owner, { from: owner, gas: new BigNumber(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as minter');
      return ROKS.cap.call();
    }
    console.log('add depot failed');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      cap = result;
      console.log('cap = ', result);
      return ROKS.totalSupply.call();
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
        big = new BigNumber(big / 2); // half of cap
        console.log('mint amount oK = ', big);
        return ROKS.mint(owner, big, { from: owner, gas: new BigNumber(420000) });
      }
      callback('mint request > cap');
    }
    console.log('cap bad result, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('minting OK, result = ', result);
      return ROKS.balanceOf(owner);
    }
    console.log('minting failed, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('balance = ', result);
      console.log('Done');
      callback();
    }
  })
  .catch((exc) => {
    console.log('caught exception: ');
    callback(exc);
  });
}

module.exports = function(callback) {
  _mintROKS(callback);
}