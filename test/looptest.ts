import { V2V2SORT } from "../utils/dexdata/V2/comparev2";
import { V2Quote, V2Input } from '../utils/price/uniswap/getPrice';
import { BigNumber } from 'ethers';

export async function testDirection(direction: string = 'flashB') {
    let arrayV2V2 = await V2V2SORT();

    arrayV2V2?.forEach(async (pool: any) => {
        var newDirection = direction
        var token0address = pool.direction.token0
        var token1address = pool.direction.token1
        var loanRouterAddress = pool.direction.loanRouter
        var recipientRouterAddress = pool.direction.recipientRouter
        var amountIn = BigNumber.from(1000)
        const route = [token0address, token1address] //Token0 is always the base asset, but that can change here if necessary.

        const amountOutA: BigNumber = await V2Quote(route[0], route[1], amountIn, loanRouterAddress)
            .catch((error: any) => {
                console.log(error)
            });
        const amountOutB: BigNumber = await V2Quote(route[0], route[1], amountIn, recipientRouterAddress)
            .catch((error: any) => {
                console.log(error)
            });

        const repayAmountInA: BigNumber = await V2Input(route[0], route[1], amountOutA, loanRouterAddress)
            .catch((error: any) => {
                console.log(error)
            });
        const repayAmountInB: BigNumber = await V2Input(route[0], route[1], amountOutB, recipientRouterAddress)
            .catch((error: any) => {
                console.log(error)
            });

        if (amountOutB.gt(amountOutA)) {
            newDirection = 'flashB'
        } else {
            newDirection = 'flashA'
        }

        if (newDirection !== direction) {
            testDirection(newDirection)
        }
    })
}
