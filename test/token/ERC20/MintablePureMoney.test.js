const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const PureMoney = artifacts.require('MintablePureMoneyMock');
const { shouldBehaveLikePublicRole } = require('../../access/roles/PublicRole.behavior');
const { ether } = require('../../helpers/ether');

contract('MintablePureMoney', function ([_, minter, otherMinter, ...otherAccounts]) {
  beforeEach(async function () {
    this.token = await PureMoney.new(minter, ether(10000), { from: minter });
    await this.token.addDepot(otherAccounts[0], { from: minter });
  });

  describe('minter role', function () {
    beforeEach(async function () {
      this.contract = this.token;
      await this.contract.addMinter(otherMinter, { from: minter });
      await this.contract.addDepot(otherAccounts[0], { from: minter });
    });

    shouldBehaveLikePublicRole(minter, otherMinter, otherAccounts, 'Minter');
  });

  shouldBehaveLikeERC20Mintable(minter, otherAccounts);
});
