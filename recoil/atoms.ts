import { atom } from 'recoil';

export const pKey = atom<string>({
    key: 'publicKey',
    default: ''
})

export const connectedWallet = atom<boolean>({
    key: 'connectedWallet',
    default: false
})