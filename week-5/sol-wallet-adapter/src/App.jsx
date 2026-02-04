import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden
import '@solana/wallet-adapter-react-ui/styles.css';
import AirDrop from './AirDrop';

export default function App() {
  const RPC_URL = import.meta.env.VITE_RPC_URL || "https://api.solana.devnet.com";
  
  return (
      <ConnectionProvider endpoint={RPC_URL}>
          <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
              <div className='flex gap-3 justify-center items-center'>
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <AirDrop />
                  
              </WalletModalProvider>
          </WalletProvider>
      </ConnectionProvider>
  );
};