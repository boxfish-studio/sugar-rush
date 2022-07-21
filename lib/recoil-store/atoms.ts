import { atom } from 'recoil'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export const candyMachineSearchState = atom({
    key: 'candyMachineSearchState',
    default: '',
})

export const candyMachinesState = atom({
    key: 'candyMachinesState',
    default: [''],
})

export const networkState = atom({
    key: 'networkState',
    default: WalletAdapterNetwork.Mainnet,
})
