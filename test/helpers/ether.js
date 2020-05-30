function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether'); // new web3.BigNumber(web3.toWei(n, 'ether'));
}

function wei(w) {
  return web3.utils.toWei(w.toString(), 'wei');
}

module.exports = {
  ether,
  wei
};
