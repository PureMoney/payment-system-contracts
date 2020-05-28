const EVANContract = artifacts.require('UniversalToken');
// const { ZERO_ADDRESS } = require('../helpers/constants');

function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether');
}

const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();
// const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const evan_token = '0x31b7754e60342b4946cfbb4b7c6485e0c78642c0'; 

let evans = null;
let cap = ether(0);

const _mintEVAN = function(callback) {
  EVANContract.at(evan_token.toLowerCase())
  .then((result, error) => {
    if (result) {
      evans = result;
      console.log('evans set');
      return evans.owner.call();
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
      return evans.isDepot.call(owner);
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
    return evans.addDepot(owner, { from: owner, gas: ether(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as depot');
      return evans.isMinter.call(owner);
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
    return evans.addMinter(owner, { from: owner, gas: ether(320000) });
  })
  .then((result, error) => {
    if (result) {
      console.log('added owner as minter');
      return evans.cap.call();
    }
    console.log('add depot failed');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      cap = result;
      console.log('cap = ', result);
      return evans.totalSupply.call();
    }
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('total supply = ', result);
      let one = ether(1);
      let big = cap.minus(one).minus(result);
      console.log('big = ', big);
      if (big.gt(one)) {
        big = ether(big / 2); // half of cap
        console.log('mint amount oK = ', big);
        return evans.mint(owner, big, { from: owner, gas: web3.utils.toWei("420000") });
      }
      callback('mint request > cap');
    }
    console.log('cap bad result, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('minting OK, result = ', result);
      return evans.balanceOf(owner);
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
  _mintEVAN(callback);
}