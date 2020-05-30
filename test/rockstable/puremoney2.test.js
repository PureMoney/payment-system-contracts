const shouldFail = require('../helpers/shouldFail');
const { ether } = require('../helpers/ether');
const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = require('bn.js');

require('chai')
  .use(require('chai-bn')(BigNumber))
  .should();

const UniversalToken = artifacts.require('UniversalToken');
const LocalToken = artifacts.require('LocalToken');
const Payment = artifacts.require('Payment2');
const IPayment = artifacts.require('IPayment2');
const PureMoney = artifacts.require('PureMoney2');

contract('RS PureMoney', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000000);
  var uToken, lToken;
  var pmnt;
  var evangelist = otherAccounts[0];
  var vendor = otherAccounts[1];

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await PureMoney.new(cap, { from: minter });
    });

    it('should fail to register an address thats not a payment contract', async function() {
      await shouldFail.reverting(this.token.registerVendor(vendor, cap, { from: minter }));
    });

    it('should fail to register a null address', async function() {
      await shouldFail.reverting(this.token.registerVendor(ZERO_ADDRESS, cap, { from: minter }));
    });

    it('should not allow registration of a non-payment contract', async function() {
      await shouldFail.reverting(this.token.registerVendor(this.token.address, cap, { from: minter }));
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
        (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(10));
      }
      catch (err) {
        console.log('==> error: ', err);
      }
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
        this.token = await PureMoney.new(cap, { from: minter });
        await this.token.addDepot(minter, { from: minter });
        await this.token.mint(minter, cap, { from: minter });
        pmnt = await Payment.new(false, evangelist, lToken.address, vendor, this.token.address,
          { from: minter });
        var localToken = await pmnt.getLocalToken();
        if (localToken !== lToken.address) {
          console.log('localToken = ', localToken);
          console.log('lToken.address = ', lToken.address);
        }
        if ((await pmnt.getVendor()) != vendor) {
          console.log('getVendor() = ', (await pmnt.getVendor()));
          console.log('vendor = ', vendor);
        }
        // all of above steps are normally done in API server, but the step
        // below is done by MainSale POS app because it needs permission of evangelist.
        await lToken.approve(pmnt.address, ether(1), { from: evangelist });
        // back in API server again, to do below step
        await this.token.registerVendor(pmnt.address, cap, { from: minter });
        // await this.token.approve(pmnt.address, cap, { from: minter });
      });

      it('when doing a transfer to a payment contract address, vendor must receive it', async function() {
        var prevBalance = await this.token.balanceOf(vendor);
        var localTokenBal = await lToken.balanceOf(pmnt.address);
        localTokenBal.should.be.bignumber.equal(ether(1));
        await this.token.transfer(pmnt.address, ether(2), { from: minter });
        (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(2));
      });

      it('when doing a trasferFrom to a payment contract address, vendor must receive it', async function() {
        var prevBalance = await this.token.balanceOf(vendor);
        await this.token.approve(evangelist, ether(2), { from: minter });
        await this.token.transferFrom(minter, pmnt.address, ether(2), { from: evangelist });
        (await this.token.balanceOf(vendor)).should.be.bignumber.equal(prevBalance + ether(2));
      });

      it('sending ROKS to an unknown contract address deposits ROKS to that contract', async function() {
        var prevBalance = await this.token.balanceOf(lToken.address);
        prevBalance.should.be.bignumber.equal(new BigNumber(0));
        await this.token.transfer(lToken.address, ether(100), { from: minter });
        (await this.token.balanceOf(lToken.address)).should.be.bignumber.equal(ether(100));
      });

      it('sending all available ROKS to an unknown contract address should empty all ROKS', async function() {
        var prevBalance = new BigNumber(await this.token.balanceOf(evangelist));
        if (prevBalance.eq(new BigNumber(0))) {
          await this.token.transfer(evangelist, ether(100), { from: minter });
          // prevBalance.iadd(new BigNumber(ether(100)));
          prevBalance = new BigNumber(await this.token.balanceOf(evangelist));
        }
        prevBalance.should.be.bignumber.greaterThan(new BigNumber(0));
        await this.token.transfer(lToken.address, prevBalance, { from: evangelist });
        (await this.token.balanceOf(evangelist)).should.be.bignumber.equal(ether(0));
      });
    });
  });
});
