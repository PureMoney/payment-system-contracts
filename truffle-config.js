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

var HDWalletProvider = require("@truffle/hdwallet-provider");
const mRopsten = "pottery wage multiply sink virus endorse cake ceiling excess dark awkward animal"; // 12 word mnemonic
const mMainnet = "";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545, // if ganache-cli then 8545, else if truffle develop then 9545
      network_id: '*'
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mRopsten, "https://ropsten.infura.io/v3/0b49da3d2bea48b6bdd8ba70ce3fa506", 0, 10);
      },
      network_id: '3'
    },
    main: {
      provider: function () {
        return new HDWalletProvider(mMainnet, "https://mainnet.infura.io/v3/4b46b3400b3f42d89df8b3871b190bcf", 0, 10);
      },
      network_id: '1',
      gas: 8300000,
      gasPrice: '40000000000'
    }
  },
  compilers: {
    solc: {
      version: "0.4.24",
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
  }
};
