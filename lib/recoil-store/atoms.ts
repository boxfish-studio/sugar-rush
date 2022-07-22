import { Nft } from 'lib/nft/interfaces'
import { NotificationState } from 'lib/interfaces'
import { atom, RecoilState } from 'recoil'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

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

export const networkState = atom({
    key: 'networkState',
    default: WalletAdapterNetwork.Mainnet,
})

export const notificationState: RecoilState<NotificationState> = atom<NotificationState>({
    key: 'notificationState',
    default: {
        open: false,
        message: '',
        title: '',
        type: 'default',
        timeout: 5000,
    },
})
