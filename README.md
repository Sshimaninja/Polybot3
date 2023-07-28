# Polybot Arbitrage Bot

Testing with hardhat on local node forked from mainnet:

$ npx hardhat node (chang block number in hardhat.config.js, best to use volatile blocks to test on actual oportunities)
$ npx hardhat run scripts/deployTest.js --network localhost (deploy contracts to local node)
$ uncomment the 'test environment' in constants/contract.ts to use the local node 
    //this can be done better, possibly with through the .env and package.json scripts, but at the moment dotenv doesn't work with addresses in the contract.ts file
$ npx ts-node index (run the bot)

The test contract has console.log for hardhat testing. The bot will run on the test contract and will log the results to the console.


# TODO 04/06/2023

-UPDATE FLASHONE.SOL TO DETERMINE TOKEN0 OR TOKEN1 ACCORDING TO NEW STRATEGY
-RE-DEPLOY CONTRACTS

# OPTIONAL
-CONVERT CURRENT WORKING BOT TO USE GASVPROFIT (BRANCH: BOTREPAIRS) This way you can run it without converting flashone.sol and deploying new contracts, though it's not as efficient as the new strategy. This could be wasted effor though.

# Bot stops after some time, I need to find out why.
Could be node issues (running my own polygon node as of this writing, though it's future is in doubt if this thing doesn't turn $100 in profit/month soon.)

