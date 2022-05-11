import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRecoilState } from 'recoil';
import { pKey, connectedWallet } from '../recoil/atoms';

const usePublicKey = () => {
  const { publicKey, connected } = useWallet();
  const [key, setKey] = useRecoilState<string>(pKey);
  const [isConnectedWallet, setIsConnecetedWallet] = useRecoilState<boolean>(connectedWallet);

  useEffect(() => {
    setKey(publicKey?.toBase58() ?? '')
  }, [publicKey])

  useEffect(() => {
    setIsConnecetedWallet(connected)
  }, [connected])

  return {
    key,
    setKey,
    isConnectedWallet,
    setIsConnecetedWallet,
  };
};

export default usePublicKey;