var UniversalToken = artifacts.require("UniversalToken");
var LocalToken = artifacts.require("LocalToken");
var PureMoney = artifacts.require("PureMoney");
var RSTIShares = artifacts.require("RSTIShares");
const { ether } = require("../test/helpers/ether.js");

module.exports = async function(deployer, network, accounts) {
  // deployer.deploy(UniversalToken);
  var uToken = await UniversalToken.new(ether(100000), 100, 3000);
  var lToken = await LocalToken.new(ether(10000000), 0, "SLT", "Some Local Token", "locality", 0, accounts[0], uToken.address);
  var pMoney = await PureMoney.new(ether(10000000000));
};
