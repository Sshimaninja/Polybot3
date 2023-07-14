
export async function getPoolImmutables(poolContract) {//Add functionality: if DEXSORT token0 pool is v3, use v3 pool contract, if v2, use v2 pool contract
    //if dexsort direction = v3 -> v2 
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee()
    ])
    const immutables = {
        token0: token0,
        token1: token1,
        fee: fee
    }

    //else
    // const [token0, token1, routerAddress] = await Promise.all([
    //     poolContract.token0(),
    //     poolContract.token1(),
    //     poolContract.routerAddress()
    // ])

    // const immutables = {
    //     token0: token0,
    //     token1: token1,
    //     routerAddress: routerAddress,
    // }

    return immutables


}


export async function getPoolState(poolContract) {
    const slot = poolContract.slot0()

    const state = {
        sqrtPriceX96: slot[0]
    }

    return state
}
