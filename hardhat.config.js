require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const { OPTIMISM_TESTNET_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    optimism_testnet: {
      url: OPTIMISM_TESTNET_RPC_URL || '',
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
