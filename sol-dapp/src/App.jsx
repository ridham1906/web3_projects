import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from 'react-hot-toast';
import Layout from './Layout';
import { clusterApiUrl } from '@solana/web3.js';

export default function App() {

  const RPC_URL = import.meta.env.VITE_RPC_URL || clusterApiUrl("devnet");
  
  return (
    <>
      <ConnectionProvider endpoint={RPC_URL}>
          <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
              <div className='mt-15 flex gap-3 justify-center items-center absolute top-0 right-5'>
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>

              <Layout />                  
              </WalletModalProvider>
          </WalletProvider>
      </ConnectionProvider>
        <Toaster position="top-center" reverseOrder={false} />
    </>
      
  );
};