# Commands: 
Start: 
npm run bot

# Deploy Hardhat tests:
Navigate to contractsv2 repo:
npx hardhat run--network localhost scripts / deployFlashDirectTestTest.ts; npx hardhat run--network localhost scripts / deployFlashMultiTest.ts




# Notes:
I've moved smart contracts to a new repo because neither VSCode, nor Hardhat can handle multiple different versions of solidity docs and compilers, resulting in insane amounts of wasted time.

# Ideas:
Price difference between assets could be used as a 'slippage' parameter, to limit trade sizes to available profit, in-line with the 'optimal arbitrage 2' problem. (Though this may already be the effective result of the tradeToPrice function.)


# References:
# In depth study on Uniswap Markets particularly, including 'Optimal Arbitrage' algos:
https://arxiv.org/pdf/1911.03380.pdf
Breakdown of 'Optimal arbitrage in Uniswap':
K = constant product, or x * y = k, where x = reserves of Token0 and y = reserves of Token1
mp = reference/marketPrice (i.e. a price you know you can trade into elsewhere)
α = tokenIn
β = tokenOut
∆α = an amount of tokenIn
∆β = an amount of TokenOut

Rα = reserves from loan pool represented as loanPool.reserves0 * loanpool.reserves1 = loanPool.constantProduct (Kl)
Rβ = reserves from target represented as target.reserves0 * target.reserves1 = target.constantProduct (Kt)

∆β' = loaned amountTokenOut + fee
∆β'- ∆β = profit

Maximize:
mp∆α − ∆β (marketPrice * amountTokenIn - amountTokenOut)

Rα = reserves of tokenIn


if
∆α, ∆β ≥ 0
(Rα − ∆α)(Rβ + γ∆β) = k


# General article on matrix/graph Arbitrage:
https://github.com/ccyanxyz/uniswap-arbitrage-analysis
Note: According to the 'Optimal arbitrage in Uniswap' article, this is completely pointless, as on any robust market like Uniswap, the fees destroy the marginal profits arbitrage is constrained to.
