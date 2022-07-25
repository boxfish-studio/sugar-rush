/**
 * The Manifest object for a given asset.
 * This object holds the contents of the asset's JSON file.
 * Represented here in its minimal form.
 */
export type Manifest = {
    image: string
    animation_url: string
    name: string
    symbol: string
    seller_fee_basis_points: number
    properties: {
        files: Array<{ type: string; uri: string }>
        creators: Array<{
            address: string
            share: number
        }>
    }
}

export type UnwrapPromise<T> = T extends Promise<infer Return> ? Return : T

export type NumberToString<T extends number | string> = T extends infer T ? (T extends number ? string : T) : never
