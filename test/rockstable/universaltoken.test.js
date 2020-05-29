const shouldFail = require('../helpers/shouldFail');
const { ether } = require('../helpers/ether');
// const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = require('bn.js');

require('chai')
  .use(require('chai-bn')(BigNumber))
  .should();

const UniversalToken = artifacts.require('UniversalToken');

contract('RS UniversalToken', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await UniversalToken.new(cap, 100, 300, { from: minter });
    });

    it('can set transaction fee to zero', async function() {
      await this.token.modifyTransFee(0, { from: minter });
      (await this.token.xactionFeeNumerator()).should.be.bignumber.equal(new BigNumber(0));
    });

    it('can modify transaction fee to less than 1%', async function() {
      await this.token.modifyTransFee(99, { from: minter });
      (await this.token.xactionFeeNumerator()).should.be.bignumber.equal(new BigNumber(99));
    });

    it('can set fee share to zero', async function() {
      await this.token.modifyFeeShare(0, { from: minter });
      (await this.token.xactionFeeShare()).should.be.bignumber.equal(new BigNumber(0));
    });

    it('can modify fee share to 30%', async function() {
      await this.token.modifyFeeShare(3000, { from: minter });
      (await this.token.xactionFeeShare()).should.be.bignumber.equal(new BigNumber(3000));
    });

    it('cannot set transaction fee to 26% (too large)', async function() {
      await shouldFail.reverting(this.token.modifyTransFee(2600, { from: minter }));
    });

    it('cannot set fee share to 34% (too large)', async function() {
      await shouldFail.reverting(this.token.modifyFeeShare(3400, { from: minter }));
    });
  });
});
