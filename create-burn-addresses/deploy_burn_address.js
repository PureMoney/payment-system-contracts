var bad = artifacts.require("burnAddress");

// Important Note: Before running this script, make sure that the installer (rock) has enough ethers.
// Each contract requires about 0.358 ether to deploy, and because there are a total of 16 contracts,
// rock must have at least 0.358 x 16 or  5.728 ethers. Including the migration contract and transactions
// with it, the total comes up to at least 5.74 ethers.
// Another Important Note: Run the following before migrating to the main Ethereum network:
// truffle networks --clean


module.exports = function(deployer, network, accounts) {
  var uToken;

  // if (network === 'develop' || network === 'development') return;

  // We use the ether function to deal with 18-place decimal numbers;
  // has nothing to do with ether, the Ethereum currency.
  // Basically, 1 ether = 10*18 wei. Wei is the smallest unit.
  function ether (n) {
    return web3.utils.toWei(n.toString(), 'ether');
  }

  const authorizedShares = ether(11000000000);

  var rock = accounts[0];

  console.log('output this ...');

  deployer.deploy( bad )
  .then((token) => {
    console.log('done: ', token);
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
}
