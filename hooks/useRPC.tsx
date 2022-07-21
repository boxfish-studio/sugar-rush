import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'

const useRPC = () => {
    const [network] = useRecoilState(networkState)

    return {
        connection: network?.connection,
        isDevnet: network?.url.includes('devnet') ? '?cluster=devnet' : '',
    }
}

export default useRPC
