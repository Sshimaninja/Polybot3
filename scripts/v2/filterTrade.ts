import { BoolTrade } from '../../constants/interfaces';
import { BigNumber as BN } from 'bignumber.js';
import { JS2BN } from './modules/convertBN';

/**
 * @param trade
 * @description
 * This function filters out trades that are not profitable, or have insufficient liquidity.
 */
export async function filterTrade(trade: BoolTrade): Promise<BoolTrade | undefined> {
	if (JS2BN(trade.target.tradeSize, trade.tokenOut.decimals).lte(0)) {
		console.log('[filteredTrade]: trade.target.tradeSize is less than or equal to 0. No trade.');
		return undefined;
	}
	if (JS2BN(trade.target.amountOut, trade.tokenOut.decimals).lte(0)) {
		console.log('[filteredTrade]: trade.target.amountOut is less than or equal to 0. No trade.');
		return undefined;
	}
	if ((trade.target.reserveInBN).lte(BN(1)) && trade.target.reserveOutBN.lte(BN(1))) {
		console.log('[filteredTrade]: Insufficient liquidity on target exchange: ', trade.ticker, ' ', trade.target.exchange, ': No trade.');
		return undefined;
	}
	if (trade.loanPool.reserveInBN.lte(BN(1)) && trade.loanPool.reserveOutBN.lte(BN(1))) {
		console.log('[filteredTrade]: Insufficient liquidity on loanPool exchange: ', trade.ticker, ' ', trade.loanPool.exchange, ': No trade.');
		return undefined;
	} else return trade;
}