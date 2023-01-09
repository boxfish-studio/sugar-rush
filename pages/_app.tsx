import { WalletProvider } from '@solana/wallet-adapter-react'
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
import { Navbar, Footer, CheckConnectedWallet, NotificationManager } from 'components'
import type { AppProps } from 'next/app'
import { useMemo } from 'react'
import { RecoilRoot } from 'recoil'
import '../styles/globals.scss'
import { theme, ThemeProvider, ThemeProviderProps } from '@primer/react'
import deepmerge from 'deepmerge'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function MyApp({ Component, pageProps }: AppProps) {
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new SolletWalletAdapter(),
            new SolletExtensionWalletAdapter(),
        ],
        []
    )
    const customTheme = deepmerge(theme, {})

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /* @ts-ignore */
        <ThemeProvider theme={customTheme}>
            <WalletProvider wallets={wallets}>
                <RecoilRoot>
                    <WalletModalProvider>
                        <Navbar />
                        <CheckConnectedWallet>
                            <div className='container-xl p-responsive height-full my-11'>
                                <Component {...pageProps} />
                            </div>
                        </CheckConnectedWallet>
                    </WalletModalProvider>
                    <NotificationManager />
                    <Footer />
                </RecoilRoot>
            </WalletProvider>
        </ThemeProvider>
    )
}

export default MyApp
