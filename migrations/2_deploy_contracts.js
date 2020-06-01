var Token = artifacts.require("Token");
var UniversalToken = artifacts.require("UniversalToken");
var CappedUniversalTokenMock = artifacts.require("CappedUniversalTokenMock");
var LocalToken = artifacts.require("LocalToken");
var PureMoney = artifacts.require("PureMoney2");
var RSTIShares = artifacts.require("RSTIShares");

// Important Note: Before running this script, make sure that the installer (rock) has enough ethers.
// Each contract requires about 0.358 ether to deploy, and because there are a total of 16 contracts,
// rock must have at least 0.358 x 16 or  5.728 ethers. Including the migration contract and transactions
// with it, the total comes up to at least 5.74 ethers.
// Another Important Note: Run the following before migrating to the main Ethereum network:
// truffle networks --clean


module.exports = function(deployer, network, accounts) {
  var uToken;

  // accounts[9] is allocated for government tax collection

  // if (network === 'develop' || network === 'development') return;

  // We use the ether function to deal with 18-place decimal numbers;
  // has nothing to do with ether, the Ethereum currency.
  // Basically, 1 ether = 10*18 wei. Wei is the smallest unit.
  function ether (n) {
    return web3.utils.toWei(n.toString(), 'ether');
  }

  const authorizedShares = ether(11000000000);

  var rock = accounts[0];

  console.log('deploying the universal contract ...');
  deployer.deploy(UniversalToken, ether(100000), 100, 3000)
  .then((instance) => {
    uToken = instance;
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000101", "Local Token for Quezon City (by RockStable Inc)", "Quezon City Second District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000102", "Local Token for Manila (by RockStable Inc)", "Manila First District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000103", "Local Token for Davao City (by RockStable Inc)", "Davao Davao del Sur Davao Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000104", "Local Token for Caloocan (by RockStable Inc)", "Caloocan City Third District NCR National Capital Reqion Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000105", "Local Token for Caloocan North (by RockStable Inc)", "Caloocan City North Third District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000106", "Local Token for Cebu City (by RockStable Inc)", "Cebu City Cebu Central Visayas Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000107", "Local Token for Zamboanga City (by RockStable Inc)", "Zamboanga City Zamboanga del Sur Zamboanga Peninsula Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000108", "Local Token for Taguig City (by RockStable Inc)", "Taguig City Fourth District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000109", "Local Token for Antipolo (by RockStable Inc)", "Antipolo Rizal Calabarzon Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000110", "Local Token for Pasig (by RockStable Inc)", "Pasig Second District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000111", "Local Token for Cagayan de Oro (by RockStable Inc)", "Cagayan de Oro City Misamis Oriental Northern Mindanao Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000112", "Local Token for Parañaque (by RockStable Inc)", "Parañaque Fourth District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000113", "Local Token for Dasmariñas (by RockStable Inc)", "Dasmariñas Cavite Calabarzon Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((token) => {
    return deployer.deploy( LocalToken, ether(10000000), 0, "RST000114", "Local Token for Valenzuela (by RockStable Inc)", "Valenzuela Third District NCR National Capital Region Philippines", accounts[9], accounts[0], uToken.address );
  })
  .then((pmnt) => {
    return deployer.deploy( PureMoney, ether(100000000000) );
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
