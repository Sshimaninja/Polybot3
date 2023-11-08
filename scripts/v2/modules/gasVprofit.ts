import { BigNumber, Contract, utils as u, ethers } from 'ethers'
import { BoolTrade } from '../../../constants/interfaces'
import { Profit } from '../../../constants/interfaces'
import { fetchGasPrice } from './fetchGasPrice';
import { getProfitInMatic } from './getProfitInMatic';
import { fu } from '../../modules/convertBN';
require('dotenv').config()
/**
 * Determines whether the profit is greater than the gas cost.
 * @param trade 
 * @returns Profit{profit: string, gasEstimate: BigNumber, gasCost: BigNumber, gasPool: string}
 */
export async function gasVprofit(trade: BoolTrade,): Promise<Profit> {
	let profit: Profit; {
		console.log("[gasVprofit]: Trade: ", trade.type, trade.loanPool.exchange, ":", trade.target.exchange, " @ ", trade.ticker, " profitPercent: ", fu(trade.profitPercent, trade.tokenOut.decimals))
		if (trade.direction == undefined) {
			console.log("Trade direction is undefined.")
			return profit = {
				profit: "undefined",
				gasEstimate: BigNumber.from(0),
				gasCost: BigNumber.from(0),
				gasPool: "undefined",
				gas: {
					gasEstimate: BigNumber.from(0),
					tested: false,
					gasPrice: BigNumber.from(0),
					maxFee: BigNumber.from(0),
					maxPriorityFee: BigNumber.from(0),
				}
			};

		} else {

			const prices = await fetchGasPrice(trade);

			if (prices.tested == true) {

				const profitinMatic = await getProfitInMatic(trade);
				if (profitinMatic != undefined) {
					if (profitinMatic.profitInMatic.gt(BigNumber.from(0))) {
						profit = {
							profit: u.formatUnits(profitinMatic.profitInMatic, 18),
							gasEstimate: prices.gasEstimate,
							gasCost: prices.gasPrice,
							gasPool: profitinMatic.gasPool.address,
							gas: prices,
						}
						console.log("Possible trade: " + trade.ticker + " Gas Estimate: ", prices.gasEstimate.toString(), "Gas Price: ", u.formatUnits(prices.gasPrice.toString()))
						// console.log("Profit: ", profit)
						return profit;
					}
					if (profitinMatic.profitInMatic.lte(BigNumber.from(0))) {
						console.log("Trade is negative.")
						return profit = {
							profit: u.formatUnits(profitinMatic.profitInMatic, 18),
							gasEstimate: prices.gasEstimate,
							gasCost: prices.gasPrice,
							gasPool: "undefined",
							gas: prices,
						};
					}
				} else if (profitinMatic == undefined) {
					console.log("Profit in Matic is undefined.")
					return profit = {
						profit: "undefined",
						gasEstimate: BigNumber.from(0),
						gasCost: BigNumber.from(0),
						gasPool: "undefined",
						gas: prices,
					};
				}
			}
		}

		return profit = {
			profit: "undefined",
			gasEstimate: BigNumber.from(0),
			gasCost: BigNumber.from(0),
			gasPool: "undefined",
			gas: {
				gasEstimate: BigNumber.from(0),
				tested: false,
				gasPrice: BigNumber.from(0),
				maxFee: BigNumber.from(0),
				maxPriorityFee: BigNumber.from(0),
			}
		};
	}
};

