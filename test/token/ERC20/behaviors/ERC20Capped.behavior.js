const shouldFail = require('../../../helpers/shouldFail');

const BigNumber = require('bn.js');

require('chai')
  .use(require('chai-bn')(BigNumber))
  .should();

function shouldBehaveLikeERC20Capped (minter, [anyone], cap) {
  describe('capped token', function () {

    it('should start with the correct cap', async function () {
      (await this.token.cap()).should.be.bignumber.equal(cap);
    });

    it('should mint when amount is less than cap', async function () {
      // console.log('anyone: ', anyone);
      await this.token.mint(anyone, cap.sub(1), { from: minter });
      (await this.token.totalSupply()).should.be.bignumber.equal(cap.sub(1));
    });

    it('should fail to mint if the ammount exceeds the cap', async function () {
      // console.log('anyone: ', anyone);
      await this.token.mint(anyone, cap.sub(1), { from: minter });
      await shouldFail.reverting(this.token.mint(anyone, 100, { from: minter }));
    });

    it('should fail to mint after cap is reached', async function () {
      // console.log('anyone: ', anyone);
      await this.token.mint(anyone, cap, { from: minter });
      await shouldFail.reverting(this.token.mint(anyone, 1, { from: minter }));
    });
  });
}

module.exports = {
  shouldBehaveLikeERC20Capped,
};
