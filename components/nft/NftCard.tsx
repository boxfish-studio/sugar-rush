import { Link, Text, Button, Spinner } from '@primer/react'
import { FC } from 'react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { VariantType } from '@primer/react/lib/Button/types'
import { useRPC } from 'hooks'

type ButtonType = 'link' | 'button'

const NftCard: FC<{
    title: string
    imageLink?: string
    buttons?: {
        text: string
        as: ButtonType
        hash?: string
        isLoading?: boolean
        variant: VariantType
        onClick?: () => void
        disabled?: boolean
    }[]
}> = ({ title, imageLink, buttons }) => {
    const { isDevnet } = useRPC()
    return (
        <div
            className='d-flex flex-column flex-justify-center flex-items-center border rounded-3 p-2'
            style={{ width: '185px' }}
        >
            <Text as='p' fontWeight='bold' className='width-full text-center mb-0'>
                {title}
            </Text>
            <div
                className='border color-bg-inset rounded-3 mb-2 overflow-hidden d-flex flex-items-center flex-justify-center'
                style={{ height: '168px', width: '168px', margin: '12px 0' }}
            >
                <div className='width-full height-full position-relative'>
                    {imageLink?.length ? (
                        <img alt={title} src={imageLink} className='object-fit-cover height-full width-full' />
                    ) : (
                        ''
                    )}
                </div>
            </div>

            {buttons
                ?.filter((btn) => btn.as === 'button')
                .map((btn, i) => (
                    <Button
                        variant={btn.variant}
                        onClick={() => btn.onClick && btn.onClick()}
                        disabled={btn.disabled}
                        key={i}
                    >
                        <div className={'d-flex flex-row flex-justify-center flex-items-center'}>
                            {btn.isLoading && <Spinner sx={{ mr: 2 }} size='small' />}
                            {btn.text}
                        </div>
                    </Button>
                ))}
            {buttons
                ?.filter((btn) => btn.as === 'link')
                .map((btn, i) => (
                    <Link
                        key={i}
                        target='_blank'
                        rel='noopener noreferrer'
                        href={`https://solscan.io/account/${btn.hash}?${isDevnet}`}
                    >
                        <Button leadingIcon={LinkExternalIcon} variant={btn.variant}>
                            {btn.text}
                        </Button>
                    </Link>
                ))}
        </div>
    )
}

export default NftCard
