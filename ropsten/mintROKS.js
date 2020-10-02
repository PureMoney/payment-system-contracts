const PureMoneyContract = artifacts.require('PureMoney2');
// const { ZERO_ADDRESS } = require('../helpers/constants');

function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether');
}

const owner = '0x3b20FE9D78e5Ce1035FCBbAf8C73779E1BDabc72'.toLowerCase(); // on BSC
// const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase(); // on Ethereum
// const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const puremoney = '0x0f7490D732eC2E5F5c518BdF75890192A84406bA'; // on BSCTest
// const puremoney = '0x89031D05bf46458d5E907AFAae91584e19C50FB9'; // bug fixed, on Ethereum
// const puremoney = '0x520e91add6be97f166c4791d9e8ca4a392467c5c'; // PureMoney2
// const puremoney = '0xa3c0a5899ee55ac29ee03f104cc9b85e32f4efe4'; // PureMoney2
// const puremoney = '0x0fe5365119ba56f8f90d43c3dd724fac7c728013';

let ROKS = null;
let cap = ether(0);

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
      var actualOwner = result.toLowerCase();
      if (actualOwner !== owner) {
        console.log("actual owner = ", actualOwner);
        callback();
      };
      console.log('now calling isDepot');
      return ROKS.isDepot.call(owner);
    };
    console.log('callback error');
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
    return ROKS.addDepot(owner, { from: owner, gas: web3.utils.toWei("320000", "wei") });
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
    return ROKS.addMinter(owner, { from: owner, gas: web3.utils.toWei("320000", "wei") });
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
      let one = ether(1);
      let big = cap.isub(result);
      console.log('big = ', big);
      if (big.gt(one)) {
        // big = ether(big / 2); // half of cap
        console.log('mint amount oK = ', big);
        return ROKS.mint(owner, big, { from: owner, gas: web3.utils.toWei("420000", "wei") });
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