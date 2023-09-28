import { FeeAmount } from '@uniswap/v3-sdk';

export async function fitFee(fee: number) {

	let feeAmount: FeeAmount;

	switch (fee) {
		case 100:
			feeAmount = FeeAmount.LOWEST;
			break;
		case 500:
			feeAmount = FeeAmount.LOW;
			break;
		case 3000:
			feeAmount = FeeAmount.MEDIUM;
			break;
		case 10000:
			feeAmount = FeeAmount.HIGH;
			break;
		default:
			throw new Error(`Invalid fee amount: ${fee}`);
	}
	return feeAmount;
}