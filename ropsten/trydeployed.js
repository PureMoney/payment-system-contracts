const LocalToken = artifacts.require('LocalToken');
const UniversalToken = artifacts.require('UniversalToken');
const Payment = artifacts.require('Payment');
const PureMoney = artifacts.require('PureMoney2');
const { ether } = require('../helpers/ether');

function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether');
}

const BigNumber = web3.utils.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

// Truffle command to run this test:
// truffle test test\rockstable\trydeployed.test.js --network ropsten
//
contract('RS LocalToken', function (accounts) {
  const cap = ether(1000);
  const rock = accounts[0];
  const evangelist = accounts[1];
  const vendor = accounts[2];
  var currentCap;
  var uToken;

  console.log('rock = ', rock);
  console.log('evangelist = ', evangelist);
  console.log('vendor = ', vendor);

  beforeEach(async function() {
    // "RST000001", "Local Token for Bellevue, WA (by RockStable Inc)", "Bellevue WA King County United States"
    this.uToken = await UniversalToken.deployed();
    this.token = await LocalToken.at('0xed2149531db338edf960c5c0541c2931d50bc714');
    //await this.token.addDepot(otherAccounts[0], { from: minter });
    console.log('Universal Token address: ', this.uToken.address);
  });

  describe('get cap then then do other ops', function () {
    beforeEach(async function () {
      currentCap = await this.token.cap();
    });

    it('get localtoken territory', async function() {
      (await this.token.localityCode()).should.be.equal('Bellevue WA King County United States');
    });

    it('get universal token from local token', async function() {
      var ut = await this.token.universalToken();
      // console.log('universal token from local token: ', ut);
      ut.should.be.equal(this.uToken.address);
    });

    it('create a payment contract', async function() {
      var pure = await PureMoney.at('0x0fe5365119ba56f8f90d43c3dd724fac7c728013');
      if ((await this.token.balanceOf(rock)) > ether(900)) {
        if (!(await this.token.isDepot(rock))) {
          await this.token.addDepot(rock, { from: rock });
        }
        await this.token.mint(rock, ether(1000), { from: rock });
      }
      if ((await this.token.balanceOf(evangelist)) > ether(1)) {
        await this.token.transfer(evangelist, ether(5), { from: rock });
      }
      var pmnt = await Payment.new(false, evangelist, this.token.address, vendor, pure.address, { from: rock });
      await this.token.approve(pmnt.address, ether(1), { from: evangelist });
      console.log('new Payment contract created, local token approved');
      await pure.registerVendor(pmnt.address, { from: rock });
      });
  });
});
