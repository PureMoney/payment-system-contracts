const LocalContract = artifacts.require('LocalToken');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;
const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();
// const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const local_token = '0x2ef9A6B0035e79a144f7C879f8E78DcABff5F0C8'; 

let locals = null;
let cap = new BigNumber(0);

const _mintLocal = function(callback) {
  LocalContract.at(local_token.toLowerCase())
  .then((result, error) => {
    if (result) {
      locals = result;
      console.log('locals set');
      return locals.owner.call();
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
      return locals.isDepot.call(owner);
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
    return locals.addDepot(owner, { from: owner, gas: new BigNumber(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as depot');
      return locals.isMinter.call(owner);
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
    return locals.addMinter(owner, { from: owner, gas: new BigNumber(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as minter');
      return locals.cap.call();
    }
    console.log('add depot failed');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      let properCap = new BigNumber(100000000000000000000000);
      cap = result;
      console.log('cap = ', result);
      if (properCap.gt(result)) {
        console.log('cap too small, increasing it');
        return locals.setCap(properCap).then(() => {return locals.totalSupply.call()});
      } else {
        return locals.totalSupply.call();
      }
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
        return locals.mint(owner, big, { from: owner, gas: new BigNumber(420000) });
      }
      callback('mint request > cap');
    }
    console.log('cap bad result, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('minting OK, result = ', result);
      return locals.balanceOf(owner);
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
  _mintLocal(callback);
}