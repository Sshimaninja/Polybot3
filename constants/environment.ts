import { Provider, ethers } from 'ethers'
import { config as dotEnvConfig } from 'dotenv'
import { abi as IflashMulti } from '../artifacts/contracts/v2/flashMulti.sol/flashMulti.json'
import { abi as IflashDirect } from '../artifacts/contracts/v2/flashDirect.sol/flashDirect.json'
import { abi as IflashMultiTest } from '../artifacts/contracts/v2/flashMultiTest.sol/flashMultiTest.json'
import { abi as IflashDirectTest } from '../artifacts/contracts/v2/flashDirectTest.sol/flashDirectTest.json'
import { IERC20Interface } from '../typechain-types/flashMulti.sol/IERC20'

export class Environment {
    constructor() {
        if (process.env.NODE_ENV === 'test') {
            dotEnvConfig({ path: '.env.test' })
        } else {
            dotEnvConfig({ path: '.env.live' })
        }
    }

    provider = new ethers.JsonRpcProvider(process.env.RPC)

    // ABIs:

    async getFlashABIs(): Promise<{
        flashMultiABI: IERC20Interface
        flashDirectABI: IERC20Interface
    }> {
        let flashMultiABI: any
        let flashDirectABI: any

        if (process.env.NODE_ENV === 'test') {
            flashMultiABI = IflashMultiTest
            flashDirectABI = IflashDirectTest
        } else {
            flashMultiABI = IflashMulti
            flashDirectABI = IflashDirect
        }
        console.log(flashMultiABI)
        console.log(flashDirectABI)
        return Promise.resolve({ flashMultiABI, flashDirectABI })
    }

    async getWallet(): Promise<{
        wallet: ethers.Wallet
        signer: ethers.Signer
    }> {
        if (process.env.PRIVATE_KEY === undefined) {
            throw new Error('No private key set in .env file')
        }

        const flashwallet = process.env.FLASH_WALLET
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
        const signer: ethers.Signer = wallet.connect(this.provider)

        return Promise.resolve({ wallet, signer })
    }

    async getContracts(): Promise<{
        flashMulti: ethers.Contract
        flashDirect: ethers.Contract
    }> {
        if (process.env.FLASH_MULTI && process.env.FLASH_DIRECT === undefined) {
            throw new Error('No flashMultiID set in .env file')
        }
        const flashMultiID = process.env.FLASH_MULTI
        const flashDirectID = process.env.FLASH_DIRECT

        if (flashMultiID === undefined || flashDirectID === undefined) {
            throw new Error('No contract address set in .env file')
        }

        const flashMulti = new ethers.Contract(
            flashMultiID,
            this.getFlashABIs.flashMultiABI,
            this.provider
        )
        const flashDirect = new ethers.Contract(
            flashDirectID,
            this.getFlashABIs.flashDirectABI,
            this.provider
        )
        return Promise.resolve({ flashMulti, flashDirect })
    }
}
