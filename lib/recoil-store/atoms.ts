import { atom, RecoilState } from 'recoil'

export const candyMachineSearchState: RecoilState<string> = atom<string>({
    key: 'candyMachineSearchState',
    default: '',
})

export const candyMachinesState: RecoilState<string[]> = atom<string[]>({
    key: 'candyMachinesState',
    default: [],
})
