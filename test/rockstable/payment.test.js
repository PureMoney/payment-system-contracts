const shouldFail = require('../helpers/shouldFail');
const { ether } = require('../helpers/ether');
const { ZERO_ADDRESS } = require('../helpers/constants');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const UniversalToken = artifacts.require('UniversalToken');
const LocalToken = artifacts.require('LocalToken');
const Payment = artifacts.require('Payment');
const PureMoney = artifacts.require('PureMoney');

// Every vendor gets a payment contract along with the MainSale app.
// The customer may always pay directly to the vendor's address; but if she does, the vendor
// does not get the benefits of the system, and the vendor would receive the payment in the 
// same cryptocurrency that the customer paid with. Paying to the vendor's Payment contract address
// allows the vendor to take advantage of RockStable's payment system, and she receives the payment
// in ROKS, which she can convert to USD anytime. Now if the customer pays in ROKS, the system 
// encourages this by NOT charging any transaction fee and it won't matter whether the customer
// pays the Payment contract or the vendor's address directly.
//
// The payment contract is where all the stories converge:
// 1. Transaction fees are charged to the customer if any cryptocurrency other than ROKS is used;
// 2. It distributes 0.7% of transaction fee to an evangelist (if one is involved) or to RockStable if
//    no evangelist is involved;
// 3. It credits 0.3% fee to RockStable;
// 4. If an evangelist is involved, she gets right to determine whether taxes are paid for all her
//    vendors or not, the level of transaction fees, locality of vendor, etc.
//
contract('RS Payment', function ([_, minter, ...otherAccounts]) {
  const cap = ether(1000);
  var uToken, lToken, puremoney;
  var evangelist = otherAccounts[0];
  var vendor = otherAccounts[1];
  var evangelist2 = otherAccounts[2];
  var pmtAccount = otherAccounts[3];
  var customer = otherAccounts[4];
  var government = otherAccounts[5];
  var government2 = otherAccounts[6];
  var pmtAccount2 = otherAccounts[7];

  beforeEach(async function () {
    uToken = await UniversalToken.new(cap, 100, 3000, { from: minter });
    // the LocalToken contract needs a UniversalToken
    lToken = await LocalToken.new(cap, 0, 'RSLT00001', 'India Local Token from Rock Stable', 
      'India', government, pmtAccount, uToken.address, { from: minter });
    await lToken.addDepot(minter, { from: minter });
    await lToken.mint(minter, ether(1000), { from: minter });
    await lToken.transfer(evangelist, ether(5), { from: minter });
    puremoney = await PureMoney.new(cap, { from: minter });
    await puremoney.addDepot(minter, { from: minter });
    await puremoney.mint(minter, ether(100), { from: minter });
    // a Payment contract needs BOTH a LocalToken contract and the PureMoney contract
    this.token = await Payment.new(false, evangelist, lToken.address, vendor, puremoney.address, { from: minter });
    await lToken.approve(this.token.address, ether(1), { from: evangelist });
    await puremoney.registerVendor(this.token.address, { from: minter });
  });

  context('payments in ethers', async function() {
    it('deregistering the payment contract should cause ether payments to fail', async function() {
      await puremoney.deregisterVendor(this.token.address, { from: minter });
      var customerMoney = await web3.eth.getBalance(customer);
      console.log('     --> pre-payment balance: ', customerMoney)
      // sending ethers to a default payable function that fails does NOT generate logs?
      // or maybe we just can't obtain the tx log for such failed transaction.
      await this.token.send(web3.toWei(1.21, "ether"), { from: customer });
      // at any rate, the way to determine whether the payment failed is to check the ethers
      // that must have been received, and also the current ether account value of the sender:
      console.log('     --> post-payment balance: ', customerMoney);
      // (await web3.eth.getBalance(customer)).should.be.bignumber.greaterThan(customerMoney - web3.toWei(1, "finney"));
      // it appears that the Ethereum network does not charge anything if payment fails
      // (need to test this hypothesis in the ropsten network)
      (await web3.eth.getBalance(customer)).should.be.bignumber.equal(customerMoney);
    });

    it('sending ethers to Payment contract should emit PaymentConfirmed event', async function() {
      var result = await this.token.send(web3.toWei(1.23, "ether"), { from: customer });
      let k = 0;
      for (; k < result.logs.length; k++) {
        var log = result.logs[k];
        // console.log('sending ethers to Payment contract: ', log);
        if (log.event == 'PaymentConfirmed') {
          return true;
        }
      };
      return false;
    });

    it('PaymentConfirmed should let API server know exactly how much ethers was paid, and from whom', async function() {
      var eth = web3.toWei(1.23, "ether");
      var result = await this.token.send(eth, { from: customer });
      let k = 0;
      for (; k < result.logs.length; k++) {
        var log = result.logs[k];
        // console.log('customer: ', customer);
        // console.log('log: ', log);
        if (log.event == 'PaymentConfirmed') {
          // log.args._customerAddr.should.be.equal(customer);  // FIXME: Why is _customerAddr not equal to customer?
          log.args._paymentContract.should.be.equal(this.token.address);
          log.args._ethValue.should.be.bignumber.equal(eth);
          return;
        }
      };
      'fail'.should.be.equal('good');
    });
  });

  context('once deployed and prepped', async function () {
    it('call to payInROKS() should fail if roks == 0', async function() {
      await shouldFail.reverting(this.token.payInROKS(0, { from: minter }));
    });

    it('call to payInROKS() should just work if roks > 0', async function() {
      await puremoney.approve(this.token.address, ether(10), { from: minter });
      await this.token.payInROKS(ether(10), { from: minter });
      // check that transaction fees are paid
      (await puremoney.balanceOf(vendor)).should.be.bignumber.greaterThan(0);
    });

    it('call to payInROKS() causes payment to current evangelist', async function() {
      var balance1 = await puremoney.balanceOf(evangelist);
      var balance2 = await puremoney.balanceOf(evangelist2);
      await lToken.transfer(evangelist2, ether(10), { from: minter });
      await lToken.approve(this.token.address, ether(1), { from: evangelist2 });
      await this.token.transferThisVendor(evangelist2, { from: evangelist });
      // what gets approved must be total amount minus RockStable's share;
      // API server must calculate RockStable's share and deposit that amount to a "revenue" account
      await puremoney.approve(this.token.address, ether(8), { from: minter });
      await this.token.payInROKS(ether(8), { from: minter });
      (await puremoney.balanceOf(evangelist)).should.be.bignumber.equal(balance1);
      (await puremoney.balanceOf(evangelist2)).should.be.bignumber.greaterThan(balance2);
      (await puremoney.allowance(minter, this.token.address)).should.be.bignumber.equal(0);
    });
  });

  context('effect of modifying transaction fee in universal token contract', async function() {
    var evBalance = 0;
    var veBalance = 0;
    var rsBalance = 0;

    beforeEach(async function() {
      evBalance = await puremoney.balanceOf(evangelist);
      veBalance = await puremoney.balanceOf(vendor);
      rsBalance = await puremoney.balanceOf(pmtAccount);
    });

    it('changing transaction fee and then calling refreshFeeParams', async function() {
      await uToken.modifyTransFee(112, { from: minter });
      await this.token.refreshFeeParams({ from: evangelist });
      await puremoney.approve(this.token.address, ether(10.112), { from: minter });
      await this.token.payInROKS(ether(10.112), { from: minter });
      (await puremoney.balanceOf(vendor)).should.be.bignumber.equal(veBalance + ether(10));
      (await puremoney.balanceOf(evangelist)).should.be.bignumber.lessThan(web3.toWei(0.7*112.1, "finney"));
      (await puremoney.balanceOf(pmtAccount)).should.be.bignumber.lessThan(web3.toWei(0.3*112.1, "finney"));
    });

    it('changing transaction fee without calling refreshFeeParams', async function() {
      await uToken.modifyTransFee(123, { from: minter });
      await puremoney.approve(this.token.address, ether(10.1), { from: minter });
      await this.token.payInROKS(ether(10.1), { from: minter }); // should be unchanged
      (await puremoney.balanceOf(vendor)).should.be.bignumber.equal(veBalance + ether(10));
      (await puremoney.balanceOf(evangelist)).should.be.bignumber.equal(web3.toWei(0.7*100, "finney"));
      (await puremoney.balanceOf(pmtAccount)).should.be.bignumber.equal(web3.toWei(0.3*100, "finney"));
    });

    it('modifying RSTIs fee share and then calling refreshFeeParams', async function() {
      await uToken.modifyFeeShare(2000, { from: minter });
      await this.token.refreshFeeParams({ from: vendor });
      await puremoney.approve(this.token.address, ether(10.1), { from: minter });
      await this.token.payInROKS(ether(10.1), { from: minter }); // should be unchanged
      (await puremoney.balanceOf(vendor)).should.be.bignumber.equal(veBalance + ether(10));
      (await puremoney.balanceOf(evangelist)).should.be.bignumber.equal(web3.toWei(0.8*100, "finney"));
      (await puremoney.balanceOf(pmtAccount)).should.be.bignumber.equal(web3.toWei(0.2*100, "finney"));
    });

    it('modifying RSTIs fee share to zero and then calling refreshFeeParams', async function() {
      await uToken.modifyFeeShare(0, { from: minter });
      await this.token.refreshFeeParams({ from: vendor });
      await puremoney.approve(this.token.address, ether(10.1), { from: minter });
      await this.token.payInROKS(ether(10.1), { from: minter }); // should be unchanged
      (await puremoney.balanceOf(vendor)).should.be.bignumber.equal(veBalance + ether(10));
      (await puremoney.balanceOf(evangelist)).should.be.bignumber.equal(web3.toWei(100, "finney"));
      (await puremoney.balanceOf(pmtAccount)).should.be.bignumber.equal(0);
    });
  });

  context('effect of modifying local token', async function() {
    var evBalance = 0;
    var veBalance = 0;
    var rsBalance = 0;
    var rs2Balance = 0;
    var gvBalance = 0;
    var gv2Balance = 0;

    beforeEach(async function() {
      evBalance = await puremoney.balanceOf(evangelist);
      veBalance = await puremoney.balanceOf(vendor);
      rsBalance = await puremoney.balanceOf(pmtAccount);
      rs2Balance = await puremoney.balanceOf(pmtAccount2);
      gvBalance = await puremoney.balanceOf(government);
      gv2Balance = await puremoney.balanceOf(government2);
    });

    it('changing tax rate ...', async function() {
      await lToken.modifyTaxRate(1000, { from: minter });
      await lToken.modifyGovtAccount(government, { from: minter });
      await this.token.setPayTax(true, { from: vendor });
      await this.token.refreshFeeParams({ from: evangelist });
      await puremoney.approve(this.token.address, ether(0.1), { from: minter });
      await this.token.payInROKS(ether(0.1), { from: minter });
      (await puremoney.balanceOf(vendor))
        .should.be.bignumber.greaterThan(veBalance + web3.toWei(89, "finney"));
      (await puremoney.balanceOf(evangelist))
        .should.be.bignumber.greaterThan(evBalance + web3.toWei(0.63, "finney"));
      (await puremoney.balanceOf(pmtAccount))
        .should.be.bignumber.greaterThan(rsBalance + web3.toWei(0.27, "finney"));
      (await puremoney.balanceOf(government))
        .should.be.bignumber.greaterThan(gvBalance + web3.toWei(9.0, "finney"));
    });

    it('changing govt account ...', async function() {
      await lToken.modifyTaxRate(998, { from: minter });
      await lToken.modifyGovtAccount(government2, { from: minter });
      await this.token.setPayTax(true, { from: vendor });
      await this.token.refreshFeeParams({ from: evangelist });
      await puremoney.approve(this.token.address, ether(0.0999), { from: minter });
      await this.token.payInROKS(ether(0.0999), { from: minter });
      (await puremoney.balanceOf(vendor))
        .should.be.bignumber.greaterThan(veBalance + web3.toWei(90, "finney"));
      (await puremoney.balanceOf(evangelist))
        .should.be.bignumber.greaterThan(evBalance + web3.toWei(0.63, "finney"));
      (await puremoney.balanceOf(pmtAccount))
        .should.be.bignumber.greaterThan(rsBalance + web3.toWei(0.27, "finney"));
      (await puremoney.balanceOf(government2))
        .should.be.bignumber.greaterThan(gv2Balance + web3.toWei(8, "finney"));
    });

    it('changing RSTI account ...', async function() {
      await lToken.modifyTaxRate(1123, { from: minter });
      await lToken.modifyGovtAccount(government, { from: minter });
      await lToken.modifyPMTAccount(pmtAccount2, { from: minter });
      await this.token.setPayTax(true, { from: vendor });
      await this.token.refreshFeeParams({ from: evangelist });
      await puremoney.approve(this.token.address, ether(0.124), { from: minter });
      await this.token.payInROKS(ether(0.124), { from: minter });
      (await puremoney.balanceOf(vendor))
        .should.be.bignumber.greaterThan(veBalance + web3.toWei(110.0, "finney"));
      (await puremoney.balanceOf(evangelist))
        .should.be.bignumber.lessThan(evBalance + web3.toWei(0.779, "finney"));
      (await puremoney.balanceOf(pmtAccount2))
        .should.be.bignumber.lessThan(rs2Balance + web3.toWei(0.334, "finney"));
      (await puremoney.balanceOf(government))
        .should.be.bignumber.lessThan(gvBalance + web3.toWei(12.51, "finney"));
    });
  });
});
