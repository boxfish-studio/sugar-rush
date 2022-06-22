import { BN } from '@project-serum/anchor'

type NumberToString<T extends number | string> = T extends infer T ? (T extends number ? string : T) : never

export interface ICache {
    authority?: string
    program: {
        uuid: string
        candyMachine: string
    }
    items: Record<
        NumberToString<number | string>,
        {
            link: string
            imageLink: string
            name: string
            onChain: boolean
            verifyRun?: boolean
        }
    >

    startDate: BN | null
    env: string
    cacheName: string
}
