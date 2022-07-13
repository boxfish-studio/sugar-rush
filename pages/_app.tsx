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
import { Navbar, Footer } from 'components'
import type { AppProps } from 'next/app'
import { useMemo } from 'react'
import '../styles/globals.scss'
import { theme, ThemeProvider, Box } from '@primer/react'
import deepmerge from 'deepmerge'
import AppWrapper from 'components/AppWrapper'

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
    const customTheme = deepmerge(theme, {})

    return (
        // @ts-ignore
        <ThemeProvider theme={customTheme}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets}>
                    <WalletModalProvider>
                        <Navbar />
                        <AppWrapper>
                            <Box className='container-xl p-responsive'>
                                <Component {...pageProps} />
                            </Box>
                        </AppWrapper>
                    </WalletModalProvider>
                    <Footer />
                </WalletProvider>
            </ConnectionProvider>
        </ThemeProvider>
    )
}

export default MyApp
