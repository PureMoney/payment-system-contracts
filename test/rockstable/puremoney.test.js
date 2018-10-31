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
  var evangelist = otherAccounts[0];
  var vendor = otherAccounts[1];

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await PureMoney.new(cap, { from: minter });
    });

    it('should fail to register an address thats not a payment contract', async function() {
      await shouldFail.reverting(this.token.registerVendor(vendor, { from: minter }));
    });

    it('should fail to register a null address', async function() {
      await shouldFail.reverting(this.token.registerVendor(ZERO_ADDRESS, { from: minter }));
    });

    it('should not allow registration of a non-payment contract', async function() {
      await shouldFail.reverting(this.token.registerVendor(this.token.address, { from: minter }));
    });
});

  context('doing payments', async function() {
    beforeEach(async function() {
      this.token = await PureMoney.new(cap, { from: minter });
      await this.token.addDepot(minter, { from: minter });
      await this.token.mint(minter, ether(1000), { from: minter });
    });

    it('when doing a transfer directly to a vendor, vendor must receive it', async function() {
      var prevBalance = await this.token.balanceOf(vendor);
      try {
        await this.token.transfer(vendor, ether(10), { from: minter });
      }
      catch (err) {
        console.log('==> error: ', err);
      }
      (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(10));
    });

    it('when doing a trasferFrom directly to a vendor, vendor must receive it', async function() {
      var prevBalance = await this.token.balanceOf(vendor);
      await this.token.approve(evangelist, ether(20), { from: minter });
      await this.token.transferFrom(minter, vendor, ether(10), { from: evangelist });
      (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(10));
    });

    context('register and then pay valid payment contract', async function() {
      beforeEach(async function() {
        uToken = await UniversalToken.new(cap, 100, 300, { from: minter });
        lToken = await LocalToken.new(cap, 0, 'RSLT00001', 'India Local Token from Rock Stable', 
          'India', ZERO_ADDRESS, minter, uToken.address, { from: minter });
        await lToken.addDepot(minter, { from: minter });
        await lToken.mint(minter, ether(1000), { from: minter });
        await lToken.transfer(evangelist, ether(5), { from: minter });
        await lToken.approve(minter, ether(1), { from: evangelist });
        pmnt = await Payment.new(false, evangelist, lToken.address, vendor, this.token.address,
          { from: minter });
      });

      it('when doing a transfer to a payment contract address, vendor must receive it', async function() {
        var prevBalance = await this.token.balanceOf(vendor);
        await this.token.registerVendor(pmnt.address, { from: minter });
        await this.token.transfer(pmnt.address, ether(10), { from: minter });
        (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(10));
      });

      it('when doing a trasferFrom to a payment contract address, vendor must receive it', async function() {
        var prevBalance = await this.token.balanceOf(vendor);
        await this.token.registerVendor(pmnt.address, { from: minter });
        await this.token.approve(evangelist, ether(20), { from: minter });
        await this.token.transferFrom(minter, pmnt.address, ether(10), { from: evangelist });
        (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(10));
      });

      it('sending ROKS to an unknown contract address deposits ROKS to that contract', async function() {
        var prevBalance = await this.token.balanceOf(lToken.address);
        prevBalance.should.be.bignumber.equal(ZERO_ADDRESS);
        await this.token.transfer(lToken.address, ether(10), { from: minter });
        (await this.token.balanceOf(lToken.address)).should.be.bignumber.equal(ether(10));
      });
    });
  });
});
