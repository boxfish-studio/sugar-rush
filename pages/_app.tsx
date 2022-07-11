import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { Navbar, Wallet, TopActions } from 'components'
import type { AppProps } from 'next/app'
import { useMemo } from 'react'
import { RecoilRoot } from 'recoil'
import '../styles/globals.scss'
import { ThemeProvider } from 'styled-components'
import { theme } from '@primer/react'

function MyApp({ Component, pageProps }: AppProps) {
    const network = WalletAdapterNetwork.Devnet
    const endpoint = useMemo(() => clusterApiUrl(network), [network])
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    )

    const customTheme = {
        // Custom Theme
    }

    return (
        <ThemeProvider theme={Object.assign({}, theme, customTheme)}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets}>
                    <Navbar />
                    <RecoilRoot>
                        <WalletModalProvider>
                            <Wallet />
                            <TopActions />
                            <Component {...pageProps} />
                        </WalletModalProvider>
                    </RecoilRoot>
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    )
}

export default MyApp
