import { Nft } from 'lib/nft/interfaces'
import { INotification } from 'lib/interfaces'
import { atom, RecoilState } from 'recoil'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'

export const candyMachineSearchState: RecoilState<string> = atom<string>({
    key: 'candyMachineSearchState',
    default: '',
})

export const candyMachinesState: RecoilState<string[]> = atom<string[]>({
    key: 'candyMachinesState',
    default: [],
})

export const nftsState: RecoilState<Nft[]> = atom<Nft[]>({
    key: 'nftsState',
    default: [],
})

export const networkState = atom<null | {
    connection: Connection
    network: keyof typeof WalletAdapterNetwork
    url: string
}>({
    key: 'networkState',
    default: null,
})

export const notificationState: RecoilState<INotification> = atom<INotification>({
    key: 'notificationState',
    default: {
        open: false,
        message: '',
        type: 'default',
        timeout: 5000,
    },
})
