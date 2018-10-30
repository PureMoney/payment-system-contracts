const should = require('chai')
  .should();

async function shouldFailWithMessage (promise, message) {
  try {
    await promise;
  } catch (error) {
    // console.log('error message: ', error.message);
    error.message.should.include(message, 'Wrong failure type');
    return;
  }

  should.fail(`Expected '${message}' failure not received`);
}

async function reverting (promise) {
  await shouldFailWithMessage(promise, 'revert');
}

async function throwing (promise) {
  await shouldFailWithMessage(promise, 'invalid opcode');
}

async function outOfGas (promise) {
  await shouldFailWithMessage(promise, 'out of gas');
}

async function checkGas (promise) {
  await shouldFailWithMessage(promise, 'check your gas amount');
}

module.exports = {
  reverting,
  throwing,
  outOfGas,
  checkGas,
};
