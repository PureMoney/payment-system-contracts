/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "pottery wage multiply float virus endorse cake ceiling excess light awkward animal"; // 12 word mnemonic


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 9545,
      network_id: '*'
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/0b49da3d2bea48b6bdd8ba70ce3fa506", 0, 10);
      },
      network_id: '3'
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    // remappings: [":g/github.com/OpenZeppelin/openzeppelin-solidity/=/home/pmt0admin/openzeppelin-solidity/"] 
    outputSelection: {
      "universaltoken.sol": {
        "*": ["abi", "evm.deployedBytecode.object"]}
    }
  }
};
