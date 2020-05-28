function ether (n) {
  return web3.utils.toWei(n.toString(), 'ether'); // new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = {
  ether,
};
