import { BigNumber } from "ethers";
import { BoolTrade, K } from "../../constants/interfaces";

export async function getK(trade: BoolTrade): Promise<K> {
    let kalc = {
        uniswapKPre: BigNumber.from(0),
        uniswapKPost: BigNumber.from(0),
        uniswapKPositive: false,
    }
    if (trade.type === "multi") {
        kalc = {
            uniswapKPre: trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut),
            uniswapKPost: trade.loanPool.reserveIn
                .sub(trade.recipient.tradeSize)
                .mul(trade.loanPool.reserveOut.add(trade.amountRepay)),
            uniswapKPositive: false,
        }
    }
    if (trade.type === "direct") {
        kalc = {
            uniswapKPre: trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut),
            uniswapKPost: trade.loanPool.reserveIn
                .sub(trade.recipient.tradeSize)
                .add(trade.amountRepay),
            uniswapKPositive: false,
        }
    } else {
        kalc = {
            uniswapKPre: BigNumber.from(0),
            uniswapKPost: BigNumber.from(0),
            uniswapKPositive: false,
        }
    }
    return kalc;
}