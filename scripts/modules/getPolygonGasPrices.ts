import axios, { AxiosResponse } from 'axios';
import { provider } from '../../constants/contract';
import { GasData } from '../../constants/interfaces';

export async function getGasData(): Promise<AxiosResponse | GasData | undefined> {
    var gasData: GasData = {
        safeLow: {
            maxPriorityFee: 41,
            maxFee: 150
        },
        standard: {
            maxPriorityFee: 52,
            maxFee: 158
        },
        fast: {
            maxPriorityFee: 120,
            maxFee: 250
        },
        estimatedBaseFee: 120,
        blockTime: 3,
        blockNumber: provider.getBlockNumber()
    }

    try {
        const response = await axios.get('https://gasstation.polygon.technology/v2');
        // console.log(response.data);
        return response.data ? response.data : gasData;
    } catch (error) {
        console.error(error);
        return gasData;
    }
}