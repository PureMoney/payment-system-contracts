const shouldFail = require('../../helpers/shouldFail');
const time = require('../../helpers/time');

const BigNumber = require('bn.js');

function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether');
}

require('chai')
  .use(require('chai-bn')(BigNumber))
  .should();

const LocalToken = artifacts.require('NoparamTokenMock');
const TokenTimelock = artifacts.require('TokenTimelock');

contract('TokenTimelock', function ([_, minter, beneficiary]) {
  const amount = ether(100);

  context('with token', function () {
    beforeEach(async function () {
      this.token = await LocalToken.new({ from: minter });
    });

    it('rejects a release time in the past', async function () {
      const pastReleaseTime = (await time.latest()) - time.duration.years(1);
      await shouldFail.reverting(
        TokenTimelock.new(this.token.address, beneficiary, pastReleaseTime)
      );
    });

    context('once deployed', function () {
      beforeEach(async function () {
        this.releaseTime = (await time.latest()) + time.duration.years(1);
        this.timelock = await TokenTimelock.new(this.token.address, beneficiary, this.releaseTime);
        await this.token.addDepot(this.timelock.address, { from: minter });
        await this.token.mint(this.timelock.address, amount, { from: minter });
      });

      it('can get state', async function () {
        (await this.timelock.token()).should.be.equal(this.token.address);
        (await this.timelock.beneficiary()).should.be.equal(beneficiary);
        (await this.timelock.releaseTime()).should.be.bignumber.equal(this.releaseTime);
      });

      it('cannot be released before time limit', async function () {
        await shouldFail.reverting(this.timelock.release());
      });

      it('cannot be released just before time limit', async function () {
        await time.increaseTo(this.releaseTime - time.duration.seconds(3));
        await shouldFail.reverting(this.timelock.release());
      });

      it('can be released just after limit', async function () {
        await time.increaseTo(this.releaseTime + time.duration.seconds(1));
        await this.timelock.release();
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });

      it('can be released after time limit', async function () {
        await time.increaseTo(this.releaseTime + time.duration.years(1));
        await this.timelock.release();
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });

      it('cannot be released twice', async function () {
        await time.increaseTo(this.releaseTime + time.duration.years(1));
        await this.timelock.release();
        await shouldFail.reverting(this.timelock.release());
        (await this.token.balanceOf(beneficiary)).should.be.bignumber.equal(amount);
      });
    });
  });
});
