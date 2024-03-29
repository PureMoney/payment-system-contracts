const shouldFail = require('../../helpers/shouldFail');
const { ether } = require('../../helpers/ether');
const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const { shouldBehaveLikeERC20Capped } = require('./behaviors/ERC20Capped.behavior');

const ERC20Capped = artifacts.require('CappedPureMoneyMock');

contract('CappedPureMoneyMock', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);

  it('requires a non-zero cap', async function () {
    await shouldFail.reverting(
      ERC20Capped.new(minter, 0, { from: minter })
    );
  });

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await ERC20Capped.new(minter, cap, { from: minter });
    });

    shouldBehaveLikeERC20Capped(minter, otherAccounts, cap);
    shouldBehaveLikeERC20Mintable(minter, otherAccounts);
  });
});
