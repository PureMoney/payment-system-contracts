var UniversalToken = artifacts.require("UniversalToken");
var LocalToken = artifacts.require("LocalToken");
var PureMoney = artifacts.require("PureMoney");
var RSTIShares = artifacts.require("RSTIShares");
var Payment = artifacts.require("Payment");

const TokenVesting = artifacts.require('TokenVesting');




module.exports = function(deployer, network, accounts) {
  const BigNumber = web3.BigNumber;

  // We use the ether function to deal with 18-place decimal numbers;
  // has nothing to do with ether, the Ethereum currency.
  // Basically, 1 ether = 10*18 wei. Wei is the smallest unit.
  function ether (n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'));
  }

  const time = require('../test/helpers/time');
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
  var start;
  var cliffDuration;
  var duration;
  time.latest().then((latest) => { 
    start = latest + time.duration.minutes(1);
    cliffDuration = time.duration.months(6);
    duration = time.duration.years(2) + cliffDuration;
    return;
  })
  .then(() => {
    return deployer.deploy(UniversalToken, ether(100000), 100, 3000);
  })
  .then((token) => {
    uToken = token;
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000001", "Local Token for Bellevue, WA (by RockStable Inc)", "Bellevue WA King County United States", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000002", "Local Token for New York NY (by RockStable Inc)", "New York NY undefined United States", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000003", "Local Token for Fayetteville AR (by RockStable Inc)", "Fayetteville AR Washington County United States", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000004", "Local Token for Jacksonville FL (by RockStable Inc)", "Jacksonville FL Duval County United States", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000005", "Local Token for Seattle WA (by RockStable Inc)", "Seattle WA King County United States", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000006", "Local Token for Cebu City Philippines (by RockStable Inc)", "Cebu City Central Visayas Cebu Philippines", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000007", "Local Token for Turkey (by RockStable Inc)", "Turkey", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000008", "Local Token for Venezuela (by RockStable Inc)", "Venezuela", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000009", "Local Token for Iran (by RockStable Inc)", "Iran", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000010", "Local Token for Vietnam (by RockStable Inc)", "Vietnam", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000011", "Local Token for Laos (by RockStable Inc)", "Laos", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000012", "Local Token for Cambodia (by RockStable Inc)", "Cambodia", 0, rock, uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000013", "Local Token for Indonesia (by RockStable Inc)", "Indonesia", 0, rock, uToken.address );
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
