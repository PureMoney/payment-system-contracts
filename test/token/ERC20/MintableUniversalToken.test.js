const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const MintableUniversalToken = artifacts.require('MintableUniversalTokenMock');
const { shouldBehaveLikePublicRole } = require('../../access/roles/PublicRole.behavior');
const { ether } = require('../../helpers/ether');

contract('MintableUniversalToken', function ([_, minter, otherMinter, ...otherAccounts]) {
  beforeEach(async function () {
    this.token = await MintableUniversalToken.new(minter, ether(10000), { from: minter });
    await this.token.addDepot(otherAccounts[0], { from: minter });
  });

  describe('minter role', function () {
    beforeEach(async function () {
      this.contract = this.token;
      await this.contract.addMinter(otherMinter, { from: minter });
    });

    shouldBehaveLikePublicRole(minter, otherMinter, otherAccounts, 'Minter');
  });

  shouldBehaveLikeERC20Mintable(minter, otherAccounts);
});
