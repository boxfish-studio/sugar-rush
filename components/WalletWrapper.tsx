/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import {
    DetailedHTMLProps,
    ImgHTMLAttributes,
    FC,
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect,
    PropsWithChildren,
    ReactElement,
    CSSProperties,
    MouseEventHandler,
} from 'react'

interface WalletIconProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    wallet: Wallet | null
}

const WalletIcon: FC<WalletIconProps> = ({ wallet }) => {
    if (!wallet) return null
    return <img src={wallet.adapter.icon} alt={`${wallet.adapter.name} icon`} height='20' width={20} />
}

export const WalletMultiButton: FC<ButtonProps> = ({ children, ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet()
    const { setVisible } = useWalletModal()
    const [copied, setCopied] = useState(false)
    const [active, setActive] = useState(false)
    const ref = useRef<HTMLUListElement>(null)

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
    const content = useMemo(() => {
        if (children) return children
        if (!wallet || !base58) return null
        return base58.slice(0, 4) + '..' + base58.slice(-4)
    }, [children, wallet, base58])

    const copyAddress = useCallback(async () => {
        if (base58) {
            await navigator.clipboard.writeText(base58)
            setCopied(true)
            setTimeout(() => setCopied(false), 400)
        }
    }, [base58])

    const openDropdown = useCallback(() => {
        setActive(true)
    }, [])

    const closeDropdown = useCallback(() => {
        setActive(false)
    }, [])

    const openModal = useCallback(() => {
        setVisible(true)
        closeDropdown()
    }, [setVisible, closeDropdown])

    useEffect(() => {
        const listener = (event: globalThis.MouseEvent | TouchEvent) => {
            const node = ref.current

            // Do nothing if clicking dropdown or its descendants
            if (!node || node.contains(event.target as Node)) return

            closeDropdown()
        }

        document.addEventListener('mousedown', listener)
        document.addEventListener('touchstart', listener)

        return () => {
            document.removeEventListener('mousedown', listener)
            document.removeEventListener('touchstart', listener)
        }
    }, [ref, closeDropdown])

    if (!wallet) return <WalletModalButton {...props}>{children}</WalletModalButton>
    if (!base58) return <WalletConnectButton {...props}>{children}</WalletConnectButton>

    return (
        <div suppressHydrationWarning className='wallet-adapter-dropdown'>
            <Button
                aria-expanded={active}
                className='wallet-adapter-button-trigger'
                style={{ pointerEvents: active ? 'none' : 'auto', ...props.style }}
                onClick={openDropdown}
                startIcon={<WalletIcon wallet={wallet} />}
                {...props}
            >
                {content}
            </Button>
            <ul
                aria-label='dropdown-list'
                className={`wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`}
                ref={ref}
                role='menu'
            >
                <li onClick={copyAddress} className='wallet-adapter-dropdown-list-item' role='menuitem'>
                    {copied ? 'Copied' : 'Copy address'}
                </li>
                <li onClick={openModal} className='wallet-adapter-dropdown-list-item' role='menuitem'>
                    Change wallet
                </li>
                <li onClick={disconnect} className='wallet-adapter-dropdown-list-item' role='menuitem'>
                    Disconnect
                </li>
            </ul>
        </div>
    )
}

type ButtonProps = PropsWithChildren<{
    className?: string
    disabled?: boolean
    endIcon?: ReactElement
    onClick?: (e: MouseEvent) => void
    startIcon?: ReactElement
    style?: CSSProperties
    tabIndex?: number
}>

export const Button: FC<ButtonProps> = (props) => (
    <button
        className={`wallet-adapter-button ${props.className || ''}`}
        disabled={props.disabled}
        // style={props.style}
        // @ts-ignore
        onClick={props.onClick}
        tabIndex={props.tabIndex || 0}
    >
        {/* {props?.startIcon ? <>{props.startIcon}</> : null} */}
        {props.children}
        {props.endIcon && <div>{props.endIcon}</div>}
    </button>
)

const WalletConnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected } = useWallet()

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            // @ts-ignore
            if (onClick) onClick(event)
            if (!event.defaultPrevented) connect().catch(() => {})
        },
        [onClick, connect]
    )

    const content = useMemo(() => {
        if (children) return children
        if (connecting) return 'Connecting ...'
        if (connected) return 'Connected'
        if (wallet) return 'Connect'
        return 'Connect Wallet'
    }, [children, connecting, connected, wallet])

    return (
        <Button
            className='wallet-adapter-button-trigger'
            disabled={disabled || !wallet || connecting || connected}
            startIcon={wallet ? <WalletIcon wallet={wallet} /> : undefined}
            // @ts-ignore
            onClick={handleClick}
            {...props}
        >
            {content}
        </Button>
    )
}

const WalletModalButton: FC<ButtonProps> = ({ children = 'Select Wallet', onClick, ...props }) => {
    const { visible, setVisible } = useWalletModal()

    const handleClick = useCallback(
        (event: MouseEvent) => {
            if (onClick) onClick(event)
            if (!event.defaultPrevented) setVisible(!visible)
        },
        [onClick, setVisible, visible]
    )

    return (
        <Button className='wallet-adapter-button-trigger' onClick={handleClick} {...props}>
            {children}
        </Button>
    )
}
