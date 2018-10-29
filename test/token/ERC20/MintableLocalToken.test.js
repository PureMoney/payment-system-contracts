const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const LocalToken = artifacts.require('MintableLocalTokenMock');
const UniversalToken = artifacts.require('UniversalToken');
const { shouldBehaveLikePublicRole } = require('../../access/roles/PublicRole.behavior');
const { ether } = require('../../helpers/ether');

contract('MintableLocalToken', function ([_, minter, otherMinter, ...otherAccounts]) {
  const cap = ether(1000);

  beforeEach(async function() {
    var uToken = await UniversalToken.new(ether(1000), 100, 3000, { from: minter });
    this.token = await LocalToken.new(minter, cap, uToken.address, { from: minter });
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
