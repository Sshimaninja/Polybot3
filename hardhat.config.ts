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

const polygonscan = process.env.POLYGONSCAN_APIKEY;
const mumbaiscan = process.env.MUMBAISCAN_API_KEY;
const infurapolygon = process.env.INFURA_POLYGON;
const alchemypolygon = process.env.ALCHEMY_POLYGON;
// task("balance", "Prints an account's balance")
//   .addParam("account", "The account's address")
//   .setAction(async (taskArgs) => {
//     const balance = await ethers.provider.getBalance(taskArgs.account);

//     console.log(ethers.utils.formatEther(balance), "ETH");
//   });

task("accounts", "Prints the list of accounts", async (taskArgs: any, hre: { ethers: { getSigners: () => any; provider: any; utils: { formatEther: (arg0: any) => any; }; }; }) => {
  const accounts = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  for (const account of accounts) {
    console.log(
      "%s (%i ETH)",
      account.address,
      hre.ethers.utils.formatEther(
        // getBalance returns wei amount, format to ETH amount
        await provider.getBalance(account.address)
      )
    );
  }
});

module.exports = {
  solidity: {
    version: "0.6.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  defaultNetwork: "polygon",
  // typechain: {
  //   outDir: 'src/types',
  //   target: 'ethers-v5',
  //   alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
  //   externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  //   dontOverrideCompile: false // defaults to false
  // },
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
// Compiled 10 Solidity files successfully
// Deploying contracts with the account: 0xAae6F269e52E00cf1ae10786b11681020C0d14C6
// Account balance: 9411596053449038463
// Deploying to: polygon
// Contract 'flashOne' deployed: 0xa425FAa4Df713d9E8BfeBf438647dD3FEee63cbb

//npx hardhat node--fork < YOUR_QUICKNODE_URL_HERE > --fork-block-number 12799760

//39323946
// `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_POLYGON_ID}`

//http://127.0.0.1:8545/
