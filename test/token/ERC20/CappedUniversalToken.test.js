const shouldFail = require('../../helpers/shouldFail');
const { ether } = require('../../helpers/ether');
const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const { shouldBehaveLikeERC20Capped } = require('./behaviors/ERC20Capped.behavior');

const UniversalToken = artifacts.require('UniversalToken');

contract('CappedUniversalTokenMock', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);

  it('requires a non-zero cap', async function () {
    await shouldFail.reverting(
      UniversalToken.new(0, 100, 3000, { from: minter })
    );
  });

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await UniversalToken.new(cap, 100, 300, { from: minter });
      await this.token.addDepot(otherAccounts[0], { from: minter });
    });

    shouldBehaveLikeERC20Capped(minter, otherAccounts, cap);
    shouldBehaveLikeERC20Mintable(minter, otherAccounts);
  });
});
