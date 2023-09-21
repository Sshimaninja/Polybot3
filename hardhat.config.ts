import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";

task("accounts", "Prints the list of accounts", async (taskArgs: any, hre: { ethers: { getSigners: () => any; provider: any; utils: { formatEther: (arg0: any) => any; }; }; }) => {
  const accounts = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  for (const account of accounts) {
    console.log(
      "%s (%i ETH)",
      account.address,
      hre.ethers.utils.formatEther(
        await provider.getBalance(account.address)
      )
    );
  }
});

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        },
        // Override the Uniswap V2 contracts to use Solidity 0.6.9
        overrides: {
          "contracts/v3/*.sol": {
            version: "0.7.6",
            settings: {
              optimizer: {
                enabled: true,
                runs: 200
              },
            },
          },
        },
      },
    ],
  },

  defaultNetwork: "polygon",
  networks: {
    hardhat: {
      mining: {
        auto: false,
        interval: 5000
      },
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/SYBkEnqFyPQHdAZr-TnaUVAmTKfvZZe-`,
        blockNumber: 42181066,
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
    },
    mumbai: {
      url: process.env.INFURA_MUMBAI,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001,
    },
    polygon: {
      // url: `https://rpc.ankr.com/polygon`,
      url: "https://polygon-mainnet.infura.io/v3/ae479bfaa1b54326a4770a0fe8aa801d",
      // url: `wss://polygon-mainnet.g.alchemy.com/v2/SYBkEnqFyPQHdAZr-TnaUVAmTKfvZZe-`,
      accounts: [process.env.PRIVATE_KEY],
      chainID: 137,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_APIKEY,
      polygonMumbai: process.env.MUMBAISCAN_API_KEY,
    }
  }
};
