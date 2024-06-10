# This is a WORK IN PROGRESS Uniswap V3 arbitrage bot. 

## NOTE: Please do not expect it to run correctly in its present (unkempt) state. It will run, but there will be bugs. I'm commiting this for portfolio purposes only, as I do not have time to complete the project right now.

It directly queries the blockchain to aggregate pairs from each exchange included in the uniswapV3Exchange object (in constants/addresses)

I chose to do it this way because many uniswap clones (including v2 and v2, and probably soon to be v4) do not have hosted subgraphs on TheGraph, making graph calls pointless as an automated search/find for aggregating pairs reliably.

At the time I started this project, using subraphs seemed to me a point of weakness which I wanted to bypass so I could add more exchanges, however, as it turns out, arbitrage in this fashion is still unprofitable, so it has instead been an excercise in scraping large amounts of data from the distributed ledger (blockchain), filtering out unworthy pairs and storing the data locally to process in arbitrage.

The Graph is growing all the time, though, and Dune analytics doesn't seem to be aimint to replace them, so aggregating pairs/runnign arbitrage from The Graph may one day actaully be possible.

This project is an unfinished/unmaintained Uniswap V3 bot, in companion to the Uniswap V2 bot I launched and ran on a private Polygon Sentry node on a Hetzner private server for about a year, without achieving profitable arbitrage. 

At this point, V3 bots may be profitable, but I am out of time to play with libraries and must stop updating this, unless it is in my spare time. 


# TODO: Refactor/integrate Uniswap V3 JSBI.BigInt because:
## ethers.js bigint and bignumber.js doesn't have smooth compatiblity and loses precision. 
## The UniswapV3 SDK is required for discovering trade sizes, and it uses JSBI.
## Until this change is made, the dummy amount of 1000 (tokenIn) is used.


# Thoughts:
The common wisdom was to learn Uniswap V2 first, then progress to Uniswap V3 protocol, but I found that by the time I had understood Uniswap V2 in its entirety, I was disinterested and somewhat annoyed by the complexity of Uniswap V3, where I would not have been had I started with the most up-to-date protocol and ignored the predecessor. 

This does make sense considering the time commitments involved in software development generally, and specifically when attempting to work with cutting-edge technology.


# Donations:

Bitcoin: bc1q2s096sa6h63uqqlqu68g62xa8hqkasj9jrthqw
ERC20: 0xd4268778C7a462FDa525DaB2A113CcFe46fabdE2


# Commands: 

Run v3 bot test:
	- In one window run 'npx hardhat node' to start a node
	- In another window, run 'npm run v3Test' to start the tests which will run through the trade object until it gets to the tradeSize calculation, at which point it will fail due to JSBI integration pending.


The following operation may be time consuming:
	Get new pairs for all uniswap v3 clones:
		npm run get3

	Match v3 pairs across exchanges and create subdocs for each
		npm run match3

# Polygon Node Snapshot:

I've update the Polygon Node snapshot.sh shell script to be a one-and-done run and sit back until it finishes. I have had to deal with multiple NVMe upgrades which makes installing the node a huge pain, but his script pretty much lets you download and then extract to your chosen directory. 

Also, Polygone formerly forced incremental updates on node operators, which caused insane amounts of bloat, so I cut those out of the download to reduce the space it used previously to 50% of that.

# Deploy Hardhat tests:

To create arb opportunity:
	npm run arbSim
	or
	npx hardhat run --network localhost test/arbSim.ts

To deploy test contracts on localhost hardhat polygon fork:
	npx hardhat run --network localhost scripts/deployFlashTest.ts;

Testing operations:
	Start the local Hardhat network with forking enabled.
	Run the arbSim.ts script to create the arbitrage opportunity.
	Run this bot on the local network.

# Output results to file:

run script to record hardhat output: 
	script -c "npx hardhat node" | grep -v "term-to-exclude" > output.txt
	
ex: exclude empty eth calls from hh results:
	script -c "npx hardhat node" | grep -vP "eth_call\s+Contract call:\s+<UnrecognizedContract>\s+From:\s+0x[a-fA-F0-9]{40}\s+To:\s+0x[a-fA-F0-9]{40}" > output.txt


re: tradeSize
				// Would be good to have a strategy that takes into account the reserves of the pool and uses the min of the three below, but that adds a lot of complexity.
				
				Wrong/deprecated:
					// This strategy attempts to use the biggest tradeSize possible. 
					// It will use toPrice, despite high slippage, if slippage creates profitable trades. 
					// If toPrice is smaller than maxIn(for slippage) it will use maxIn.
				According to Uniswap Analysis (see README), AMMs are resistant to large trades, thus the above strategy is flawed. 
				
				Instead this tradesize will ensure that trades are not > reserves, and above, size will be min(maxIn, toPrice)
				
				(Hopefully limiting by target.maxOut is redundant because maxIn works on slippage in the same way, and amountsOut will only calculate a number it will output.)


JETSWAP: Removing Jetswap for now as all trades seem to exit prematurely out of contract without reason.


It would seem like you want to 'buy' the cheaper token, but you actually want to 'sell' the more expensive token.




# Ideas:

Price difference between assets could be used as a 'slippage' parameter, to limit trade sizes to available profit, in-line with the 'optimal arbitrage 2' problem. (Though this may already be the effective result of the tradeToPrice function.)


# General article on matrix/graph Arbitrage:
https://github.com/ccyanxyz/uniswap-arbitrage-analysis
Note: According to the 'Optimal arbitrage in Uniswap' article, this is completely pointless, as on any robust market like Uniswap, the fees destroy the marginal profits arbitrage is constrained to.



###### NOTES FROM UNISWAP DISCORD / CRYPTO RACHEL:

Price Impact Math:

##Based on 10,000 sell token0

orgTotalToken0 = 2000000
orgTotalToken1 = 1000

tokenAmount0selling = 10000

ConstantProduct = orgTotalToken0 * orgTotalToken1

orgPrice = orgTotalToken0/orgTotalToken1

token1change = (orgTotalToken1 - (ConstantProduct / (tokenAmount0selling + orgTotalToken0)))

PricePaidPerToken1 = tokenAmount0selling / token1change

priceDifference = PricePaidPerToken1 - orgPrice

intImpact = priceDifference / orgPrice

PercentImpact = intImpact * 100



# Helfpul stuff:

regex to get rid of script/hardhat bumf:
^(.*Mined empty block range #)(.*)$

