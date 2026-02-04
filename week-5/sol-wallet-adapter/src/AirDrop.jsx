import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect } from "react";
import { useState } from "react";

export default function AirDrop() {
  
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const LAMPORTS_PER_SOL = 1000000000;
  const currBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.connected || !connection) {
        console.log("runed");
        setBalance(0);
        return;
      }
      
      try {
        const res = await connection.getBalance(wallet.publicKey);
        setBalance(res);
      } catch (err) {
        console.log(err);
      }
    }
    
    fetchBalance();
    
  }, [wallet, connection])

  const sendAirdropToUser = async () => {
    if (!wallet.connected) {
      alert("Please connect your wallet first");
    }
    
    if (!amount) {
      alert("Please enter an amount");
    }
    
    setLoading(true);
    try {
      await connection.requestAirdrop(wallet.publicKey, amount * LAMPORTS_PER_SOL);    
      setSuccess(true); 
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="p-3">
        <h1 className="text-2xl text-center my-2">SOL Faucet</h1>
        <p className="text-red-500"> Note: This not give real $SOL or SOL token, it gives devnet tokens </p>
      </div>
      
      <div className="flex gap-3 justify-center items-start mt-2">
        <div className="flex flex-col gap-2 items-end">
          <input
            type="number"
            className="ring-2 ring-gray-500 focus:ring-offset-1 focus:ring-indigo-600 focus:outline-none rounded-lg py-2 px-3"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e)=> setAmount(e.target.value)}
          />
          <span className="text-sm text-gray-500 font-semibold">{wallet.connected ? currBalance : 0} SOL</span>
        </div>
        <button onClick={sendAirdropToUser}> {!loading ? "Airdrop" : "Dropping..."} </button>
      </div>
      <div className="text-center mt-3">
        {
          success && !loading && <p className="text-green-500">Airdrop successful!</p>
        }
        {
          error && !loading && <p className="text-red-500">Airdrop failed!</p>
        }
      </div>
    </>
  )
}
