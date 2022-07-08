import { web3 } from '@project-serum/anchor'
import {
    CANDY_MACHINE_PROGRAM_V2_ID,
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_METADATA_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from './constants'

export const getAtaForMint = async (mint: web3.PublicKey, buyer: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
    return await web3.PublicKey.findProgramAddress(
        [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
}

export const getMetadata = async (mint: web3.PublicKey): Promise<web3.PublicKey> => {
    return (
        await web3.PublicKey.findProgramAddress(
            [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
            TOKEN_METADATA_PROGRAM_ID
        )
    )[0]
}

export const getMasterEdition = async (mint: web3.PublicKey): Promise<web3.PublicKey> => {
    return (
        await web3.PublicKey.findProgramAddress(
            [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
            TOKEN_METADATA_PROGRAM_ID
        )
    )[0]
}

export const getCandyMachineCreator = async (candyMachine: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
    return await web3.PublicKey.findProgramAddress(
        [Buffer.from('candy_machine'), candyMachine.toBuffer()],
        CANDY_MACHINE_PROGRAM_V2_ID
    )
}
