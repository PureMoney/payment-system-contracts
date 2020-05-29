const LocalToken = artifacts.require('LocalToken');
const UniversalToken = artifacts.require('UniversalToken');
const { ether, wei } = require('../helpers/ether');
const { ZERO_ADDRESS } = require('../helpers/constants');
const shouldFail = require('../helpers/shouldFail');

const BigNumber = require('bn.js');

require('chai')
  .use(require('chai-bn')(BigNumber))
  .should();

contract('RS LocalToken', function ([_, minter, otherMinter, ...otherAccounts]) {
  const cap = ether(1000);

  beforeEach(async function() {
    var uToken = await UniversalToken.new(cap, 100, 3000, { from: minter });
    this.token = await LocalToken.new(cap, 0, 'RSLT00001', 'India Local Token from Rock Stable', 
      'India', ZERO_ADDRESS, minter, uToken.address, { from: minter });
    await this.token.addDepot(otherAccounts[0], { from: minter });
  });

  describe('other minter added as minter', function () {
    beforeEach(async function () {
      await this.token.addMinter(otherMinter, { from: minter });
    });

    it('other minter can change territory name', async function() {
      await this.token.modifyLocality('Punjab, India', { from: otherMinter });
      (await this.token.localityCode()).should.be.equal('Punjab, India');
    });

    it('other minter can change tax rate and govt account', async function() {
      await this.token.modifyTaxRate(110, { from: otherMinter });
      (await this.token.taxRateNumerator()).should.be.bignumber.equal(new BigNumber(110));
      await this.token.modifyGovtAccount(otherAccounts[0], { from: otherMinter });
      (await this.token.govtAccount()).should.be.bignumber.equal(otherAccounts[0]);
    });
  });

  describe('other minter should fail, if not added as minter', function () {
    beforeEach(async function () {
      (await this.token.isMinter(otherMinter)).should.be.equal(false);
    });

    it('other minter cannot change territory name', async function() {
      await shouldFail.reverting(this.token.modifyLocality('Punjab, India', { from: otherMinter }));
    });

    it('other minter cannot change tax rate', async function() {
      await shouldFail.reverting(this.token.modifyTaxRate(110, { from: otherMinter }));
    });

    it('other minter cannot change govt account, even if taxrate > 0', async function() {
      await this.token.modifyTaxRate(1100, { from: minter });
      (await this.token.taxRateNumerator()).should.be.bignumber.equal(new BigNumber(1100, 10));
      await shouldFail.reverting(this.token.modifyGovtAccount(otherAccounts[0], { from: otherMinter }));
    });
  });

  describe('local tax changes', function() {
    it('can change tax rate to 10%', async function() {
      await this.token.modifyTaxRate(1000, { from: minter });
      (await this.token.taxRateNumerator()).should.be.bignumber.equal(new BigNumber(1000, 10));
    });

    it('minter cannot change tax rate to 51%', async function() {
      await shouldFail.reverting(this.token.modifyTaxRate(5100, { from: minter }));
    });

    it('can reset govt account because tax rate is zero', async function() {
      await this.token.modifyGovtAccount(ZERO_ADDRESS, { from: minter });
      (await this.token.govtAccount()).should.be.bignumber.equal(new BigNumber(ZERO_ADDRESS, 'hex'));
    });

    it('cannot set govt address if tax rate is zero', async function() {
      await shouldFail.reverting(this.token.modifyGovtAccount(otherAccounts[0], { from: minter }));
    });

    it('can set govt address if tax rate is non-zero', async function() {
      await this.token.modifyTaxRate(850, { from: minter });
      (await this.token.taxRateNumerator()).should.be.bignumber.equal(new BigNumber(850, 10));
      await this.token.modifyGovtAccount(otherAccounts[0], { from: minter });
      (new BigNumber(await this.token.govtAccount(), 'hex')).should.be.bignumber
      .equal(new BigNumber(otherAccounts[0], 'hex'));
    });
  });

  describe('modifying rock stable account', function () {
    beforeEach(async function () {
      (await this.token.isMinter(otherMinter)).should.be.equal(false);
    });

    it('other minter cannot change rock stable account', async function() {
      await shouldFail.reverting(this.token.modifyPMTAccount(otherMinter, { from: otherMinter }));
    });

    it('owner can change rock stable account', async function() {
      await this.token.modifyPMTAccount(otherMinter, { from: minter });
      (new BigNumber(await this.token.pmtAccount(), 'hex')).should.be.bignumber
      .equal(new BigNumber(otherMinter, 'hex'));
    });

    it('even owner cannot set rock stable account to zero', async function() {
      await shouldFail.reverting(this.token.modifyPMTAccount(ZERO_ADDRESS, { from: minter }));
    });
  });
});
