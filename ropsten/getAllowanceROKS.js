const PureMoneyContract = artifacts.require('PureMoney2');
// const { ZERO_ADDRESS } = require('../helpers/constants');


const owner = '0x3b20FE9D78e5Ce1035FCBbAf8C73779E1BDabc72'.toLowerCase(); // on BSC
// const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase(); // on Ethereum
// const pmtAccount = '0x1Fb18FE4a3b773d61E9851f54d35948114e4806E'.toLowerCase();

const puremoney = '0x78e897D906e83391Ff0E437735F43452E6259C13'; // on BSC
// const puremoney = '0xa3c0a5899ee55ac29ee03f104cc9b85e32f4efe4'; // PureMoney2

function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether');
}

let ROKS = null;
let cap = ether(0);
let actualOwner = owner;

module.exports = function(deployer, network, accounts) {
  console.log('network: ', network);
  console.log('address0: ', accounts[0]);
  
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
      actualOwner = result;
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
    };
    return ROKS.allowance(source, spender);
  })
  .then((result, error) => {
    if (result) {
      console.log('got allowance for ', spender);
      console.log('allowance = ', result);
      return ROKS.isMinter(source);
    };
    callback(error);
  })
  .then((result, error) => {
    if (error) {
      callback(error);
    };
    if (result) {
      console.log('Source is minter');
    } else {
      console.log('Source is NOT minter');
    };
    return ROKS.allowance(actualOwner, spender);
  })
  .then((result, error) => {
    if (result) {
      console.log('got allowance for ', actualOwner);
      console.log('allowance = ', result);
      return ROKS.isMinter(actualOwner);
    };
    callback(error);
  })
  .then((result, error) => {
    if (error) {
      callback(error);
    };
    if (result) {
      console.log("Actual owner is a minter");
      return ROKS.cap.call();
    }
    console.log('isMinter call failed');
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
      return ROKS.balanceOf(source);
    }
    console.log('totalSupply call failed, error = ');
    callback(error);
  })
  .then((result, error) => {
    if (result) {
      console.log('source balance = ', result);
      console.log('Done');
      callback();
    }
  })
  .catch((exc) => {
    console.log('caught exception: ');
    callback(exc);
  });
}

// module.exports = function(callback) {
//   _allowanceROKS('0x1fb18fe4a3b773d61e9851f54d35948114e4806e', '0x1ef01b6dbe2eecf145b0fb62a74b17eb94838db2', callback);
// }