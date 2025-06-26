require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 11155111
    },
    zetachain: {
      url: process.env.ZETACHAIN_RPC,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 7001
    }
  }
};