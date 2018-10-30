const shouldFail = require('../helpers/shouldFail');
const { ether } = require('../helpers/ether');
const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const UniversalToken = artifacts.require('UniversalToken');
const LocalToken = artifacts.require('LocalToken');
const Payment = artifacts.require('Payment');
const PureMoney = artifacts.require('PureMoney');

contract('RS PureMoney', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);
  var uToken, lToken, pmnt;

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await PureMoney.new(cap, { from: minter });
    });

    it('should fail to register an address thats not a payment contract', async function() {
      await shouldFail.reverting(this.token.registerVendor(otherAccounts[0], { from: minter }));
    });

    it('should fail to register a null address', async function() {
      await shouldFail.reverting(this.token.registerVendor(ZERO_ADDRESS, { from: minter }));
    });
  });

  context('with all supporting tokens', async function() {
    beforeEach(async function() {
      uToken = await UniversalToken.new(cap, 100, 300, { from: minter });
      lToken = await LocalToken.new(cap, 0, 'RSLT00001', 'India Local Token from Rock Stable', 
        'India', ZERO_ADDRESS, minter, uToken.address, { from: minter });
      await lToken.addDepot(minter, { from: minter });
      await lToken.mint(minter, ether(1000), { from: minter });
      this.token = await PureMoney.new(cap, { from: minter });
      await lToken.transfer(otherAccounts[0], ether(5), { from: minter });
      await lToken.approve(minter, ether(1), { from: otherAccounts[0] });
      pmnt = await Payment.new(false, otherAccounts[0], lToken.address, otherAccounts[1], this.token.address,
         { from: minter });
    });

    it('should allow valid payment contract', async function() {
      await this.token.registerVendor(pmnt.address, { from: minter });
    });
  });
});
