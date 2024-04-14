import { Contract } from 'ethers'
import { getQuoterV2, getProtocol } from '../../../modules/getContract'
import { abi as IUni3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { signer } from '../../../../constants/provider'
import { pu } from '../../../modules/convertBN'

async function univ3Quote(poolID: string, tradeSize: bigint) {
    const quoter = getQuoterV2('UNIV3')
    const pool = new Contract(poolID, IUni3Pool, signer)

    let encoded = {
        tokenIn: await pool.token0(),
        tokenOut: await pool.token1(),
        amountIn: tradeSize.toString(),
        fee: await pool.fee(),
        sqrtPriceLimitX96: '0',
    }
    try {
        let maxOut = await quoter
            .getFunction('quoteExactInputSingle')
            .staticCall(encoded)
        console.log('maxOut: ')
        console.log(maxOut)
        return maxOut.amountOut
    } catch (error: any) {
        console.log(error)
        console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ')
        return 0n
    }
}
univ3Quote('0x89f485b9514E41276a58bBF54090D01B2Ce7e7b2', pu('10', 18))
