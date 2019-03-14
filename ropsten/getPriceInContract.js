const Payment2 = artifacts.require('Payment2');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;
const owner = '0x640C46042b4C50b4f4910b044898e80701203c58'.toLowerCase();

const payment2 = '0x1ef01b6dbe2eecf145b0fb62a74b17eb94838db2'; // Payment2
// 0x1fb18fe4a3b773d61e9851f54d35948114e4806e // PmtAccount

let pmnt = null;
let cap = new BigNumber(0);
let actualOwner = owner;

const _getPrice = function(contract, callback) {
  Payment2.at(contract)
  .then(pmntr => {
    pmnt = pmntr;
    if (!pmnt) throw error('Payment contract does not exist');
    return pmnt.ethPrice.call();
  })
  .then(price =>{
    if (!price) throw error('ETH Price unset');
    console.log('Price = ', price);
    return pmnt.roksExpected.call();
  })
  .then(roks => {
    if (!roks) throw error('ROKS expectd unset');
    console.log('ROKS = ', roks);
    callback();
  })
  .catch(error => {
    console.log('Error: ', error);
  })
}

module.exports = function(callback) {
  _getPrice(payment2, callback);
}