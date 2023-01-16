/**
* @type import('hardhat/config').HardhatUserConfig
*/
// require("@nomiclabs/hardhat-ethers");
require('@nomiclabs/hardhat-waffle');
module.exports = {
  solidity: "0.8.16",
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/p9xmSdoKrkNFWM7RpdJiQkDnL8oJDiyb",
      accounts: ['0xd70955741582f4a6e2afc67e913468cf54b07934b297d00a96c79ab76c787d1b']
    },
    ganache: {
      url: 'http://127.0.0.1:8545',
      accounts: ['0x70100c90eaba6e0c117389fafc7cc05195e786eac06b97960a5d64bc292b4a99']
    }
  },
}
