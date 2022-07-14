import { atom } from 'recoil'

export const candyMachineSearchState = atom({
    key: 'candyMachineSearchState',
    default: '',
})

export const candyMachinesState = atom({
    key: 'candyMachinesState',
    default: [''],
})
