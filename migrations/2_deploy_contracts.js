var Token = artifacts.require("Token");
var UniversalToken = artifacts.require("UniversalToken");
var CappedUniversalTokenMock = artifacts.require("CappedUniversalTokenMock");
var LocalToken = artifacts.require("LocalToken");
var PureMoney = artifacts.require("PureMoney");
var RSTIShares = artifacts.require("RSTIShares");

// Important Note: Before running this script, make sure that the installer (rock) has enough ethers.
// Each contract requires about 0.358 ether to deploy, and because there are a total of 16 contracts,
// rock must have at least 0.358 x 16 or  5.728 ethers. Including the migration contract and transactions
// with it, the total comes up to at least 5.74 ethers.


module.exports = function(deployer, network, accounts) {
  var uToken;

  // if (network === 'develop' || network === 'development') return;

  const BigNumber = web3.BigNumber;

  // We use the ether function to deal with 18-place decimal numbers;
  // has nothing to do with ether, the Ethereum currency.
  // Basically, 1 ether = 10*18 wei. Wei is the smallest unit.
  function ether (n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'));
  }

  const authorizedShares = new BigNumber(ether(11000000000));

  var rock = accounts[0];

  deployer.deploy(UniversalToken, ether(100000), 100, 3000)
  // deployer.deploy( CappedUniversalTokenMock, ether(100000))
  .then((instance) => {
    uToken = instance;
    // var token = Token.at(uToken.address);
    // token.contract.OwnerModified(function(dummy1, eventData) {
    //   console.log('eventData: ', eventData.event, eventData.args);
    // });
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000001", "Local Token for Bellevue, WA (by RockStable Inc)", "Bellevue WA King County United States", 0, rock, uToken.address );
  })
  .then((token) => {
    // token.OwnerModified(function(dummy1, eventData) {
    //   console.log('      --> local token event');
    //   console.log('      eventData: ', eventData.event, eventData.args);
    // });
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
  .then((pmnt) => {
    return deployer.deploy( PureMoney, ether(10000000000) );
  })
  .then((pMoney) => {
    return deployer.deploy(RSTIShares, accounts[0], authorizedShares);
  })
  .then((t) => {
    console.log('all contracts deployed');
  })
  .catch((err) => {
    console.log(err);
  });
};