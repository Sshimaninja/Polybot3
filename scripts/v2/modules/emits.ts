import { utils } from "ethers";
import { provider, logger } from "../../../constants/contract";
import { BoolTrade } from "../../../constants/interfaces";

export async function logEmits(trade: BoolTrade, req: any) {

    const filter = {
        address: trade.flash.address,
        topics: [
            utils.id("log(string,uint256)"),
            utils.id("logValue(string,uint256)"),
            utils.id("logAddress(string,address)"),
        ],
        fromBlock: "latest",
        toBlock: "pending"
    }
    const logs = provider.on(filter, (log, logValue, logAddress) => {
        logger.info(log)
        logger.info(logValue)
        logger.info(logAddress)
    });
    provider.once(req.txResponse.hash, (transaction) => {
        logger.info(req.txResponse.hash)
        logger.info(transaction)
    })
    const emits = {
        logs: logs,
    }
    return emits

}
