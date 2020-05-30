const shouldFail = require('../../helpers/shouldFail');
const { ether } = require('../../helpers/ether');
const { shouldBehaveLikeERC20Mintable } = require('./behaviors/ERC20Mintable.behavior');
const { shouldBehaveLikeERC20Capped } = require('./behaviors/ERC20Capped.behavior');

const UniversalToken = artifacts.require('UniversalToken');
const LocalToken = artifacts.require('LocalToken');

const BigNumber = require('bn.js');

contract('CappedLocalTokenMock', function ([_, minter, ...otherAccounts]) {
  const cap = new BigNumber(ether(1000));
  var uToken;

  beforeEach(async function() {
    uToken = await UniversalToken.new(cap, new BigNumber(100), new BigNumber(3000), { from: minter });
    // uToken.OwnerModified(function(dummy1, eventData) {
    //   console.log('universal token event');
    //   console.log('dummy1: ', dummy1);
    //   console.log('eventData: ', eventData.event, eventData.args);
    // });
    // console.log('created universal token');
  });

    it('requires a non-zero cap', async function () {
      await shouldFail.reverting(
        LocalToken.new(new BigNumber(0), 0, 'RSLT0001', 'RockStable LocalToken', 'Argentina', '0xb090500000000000abc2ef000000030000000004', minter, uToken.address, { from: minter })
      );
    });

    it('once deployed', async function () {
      // console.log('tests start, uToken.address: ', uToken.address);
      beforeEach(async function () {
        this.token = await LocalToken.new(cap, 0, 'RSLT0002', 'RockStable LocalToken', 'Venezuela', '0xb090500000000000abc2ef000000030000000004', minter, uToken.address, { from: minter });
        await this.token.addDepot(otherAccounts[0], { from: minter });
        // console.log('otherAccounts[0]: ', otherAccounts[0]);
        // console.log('minter: ', minter);
        // console.log('isMinter: ', await this.token.isMinter(minter));
        // console.log('isCapper: ', await this.token.isCapper(minter));
        // console.log('isDepot: ', await this.token.isDepot(otherAccounts[0]));
      });

      shouldBehaveLikeERC20Capped(minter, otherAccounts, cap);
      shouldBehaveLikeERC20Mintable(minter, otherAccounts);
    });
});
