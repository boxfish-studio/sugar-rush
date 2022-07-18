import { Nft } from 'lib/nft/interfaces'
import { atom, RecoilState } from 'recoil'

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
