export interface Nft {
    name: string
    image: string
    symbol?: string
    description?: string
    animation_url?: string
    external_url?: string
    attributes?: IAtributesNft[]
    properties?: IPropertiesNft
    category?: string
    collection?: string | ICollectionNft
    creators?: ICreatorsNft[]
    seller_fee_basis_points?: number
}

interface IAtributesNft {
    trait_type: string
    value: string
}

interface IPropertiesNft {
    files: IPropertyFileNft[]
    creators?: ICreatorsNft[]
}

interface ICollectionNft {
    name: string
    family: string
}

interface IPropertyFileNft {
    uri: string
    type: string
    cdn?: boolean
}

interface ICreatorsNft {
    address: string
    share: number
}
