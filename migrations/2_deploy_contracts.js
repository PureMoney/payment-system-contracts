var UniversalToken = artifacts.require("UniversalToken");
var LocalToken = artifacts.require("LocalToken");
var PureMoney = artifacts.require("PureMoney");
var RSTIShares = artifacts.require("RSTIShares");
var Payment = artifacts.require("Payment");

const TokenVesting = artifacts.require('TokenVesting');



// We use the ether struct to deal with 18-place decimal numbers;
// has nothing to do with ether, the Ethereum currency.
// Basically, 1 ether = 10*18 wei. Wei is the smallest unit.

module.exports = function(deployer, network, accounts) {
//  const { ether } = require("../test/helpers/ether.js");
//  const time = require('../test/helpers/time');
  const BigNumber = web3.BigNumber;

  function ether (n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'));
  }

  const authorizedShares = new BigNumber(ether(11000000000));

  var rock = accounts[0];
  var evangelist = accounts[1];
  var vendor = accounts[2];
  var beneficiary = accounts[3];

  if (network == "ropsten") {
    rock = address("0x95BfD3a00587d4c9EB6846eA7748777e798e7410");
    evangelist = address("0x92d2c6b5516fae8d3c69a110cdd602efd48e27fe");
    vendor = address("0x793d575b31922c6fefa4e63de12c3d4d7ae58398");
    beneficiary = address("0xbcfdbe36869037be252bf2dfcfcd93b534fdd697");
  }

  // +1 minute so it starts after contract instantiation
//  var start;
//  var cliffDuration;
//  var duration;
//  time.latest().then((latest) => { 
//    start = latest + time.duration.minutes(1);
//    cliffDuration = time.duration.months(6);
//    duration = time.duration.years(2) + cliffDuration;
//    return;
//  })
//  .then(() => {
  deployer.deploy(UniversalToken, ether(100000), 100, 3000)
  .then((uToken) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "SLT", "Some Local Token", "locality", 0, rock, uToken.address );
  })
//  .then((lToken) => {
//    return deployer.deploy(Payment, 0, evangelist, lToken.address, vendor, rock);
//  })
  .then((pmnt) => {
    return deployer.deploy( PureMoney, ether(10000000000) );
  })
  .then((pMoney) => {
    return deployer.deploy(RSTIShares, accounts[0], authorizedShares);
  })
//  .then((rShares) => {
//    return deployer.deploy(TokenVesting, beneficiary, start, cliffDuration, duration, true, { from: rock });
//  })
  .catch((err) => {
    console.log(err);
  });
};
