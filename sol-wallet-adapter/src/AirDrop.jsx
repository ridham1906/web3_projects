import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AirDrop ({updateBalance, balance}) {
  
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const LAMPORTS_PER_SOL = 1000000000;
  const currBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);
  const currBalanceRef = useRef(currBalance);

  useEffect(() => {
    currBalanceRef.current = (balance / LAMPORTS_PER_SOL).toFixed(2);
  }, [balance])

  const sendAirdropToUser = async () => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    
    setLoading(true);
    try {
      await connection.requestAirdrop(wallet.publicKey, amount * LAMPORTS_PER_SOL);   
      updateBalance((prev) => prev + (amount * LAMPORTS_PER_SOL));
      setAmount("")
      toast.success("Airdrop successful!");
    } catch (err) {
      console.log(err);
      toast.error("Airdrop failed!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-4xl text-center mb-10">SOL Faucet</h1>
      
      <div className="flex gap-3 justify-center items-start mt-4">
        <div className="flex flex-col gap-2 items-end">
          <input
            type="number"
            className="ring-2 ring-gray-500 focus:ring-offset-1 focus:ring-indigo-600 focus:outline-none rounded-lg py-2 px-3"
            placeholder="Enter Amount"
            onFocus={(e)=> e.target.select()}
            value={amount}
            onChange={(e)=> setAmount(e.target.value)}
          />
        </div>
        <button onClick={sendAirdropToUser}> {!loading ? "Airdrop" : "Dropping..."} </button>
      </div>
      <p className="text-red-500 text-sm mt-4"> Note: This not give real $SOL or SOL token, it gives devnet tokens </p>
    </>
  )
}
