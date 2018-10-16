const shouldFail = require('../../helpers/shouldFail');
const { ether } = require('../../helpers/ether');
const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const { shouldBehaveLikeERC20Capped } = require('./behaviors/ERC20Capped.behavior');

const UniversalToken = artifacts.require('CappedUniversalTokenMock');
const ERC20Capped = artifacts.require('CappedLocalTokenMock');

contract('CappedLocalTokenMock', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);
  var uToken;

  it('requires a non-zero cap', async function () {
    uToken = await UniversalToken.new(cap, { from: minter });
    await shouldFail.reverting(
      ERC20Capped.new(0, uToken.address, { from: minter })
    );
  });

  context('once deployed', async function () {
    beforeEach(async function () {
      this.token = await ERC20Capped.new(cap, uToken.address, { from: minter });
    });

    shouldBehaveLikeERC20Capped(minter, otherAccounts, cap);
    shouldBehaveLikeERC20Mintable(minter, otherAccounts);
  });
});
