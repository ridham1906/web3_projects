import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey} from "@solana/web3.js"
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SendSol ({updateBalance}){

    const {publicKey, sendTransaction} = useWallet();
    const {connection} = useConnection();

    const [tcxData, setTcxData] = useState({
        to: "",
        amount: 0
    });
    const [sending, setSending] = useState(false);

    useEffect(()=> {
        if(!connection || !publicKey) toast.error("Connect wallet first");
        return;
    }, [connection, publicKey])


    const initTransaction = async()=> {
        if(tcxData.amount == 0 || !tcxData.to) return toast.error("Fill the details")
        if(tcxData.amount < 0) return toast.error("Amount should be greater than 0");
        if(!PublicKey.isOnCurve(tcxData.to)) return toast.error("Invalid wallet address");

       if(!connection || !publicKey) return toast.error("Connect waller first!");
       
       setSending(true);
       try{
         
        const transaction = new Transaction();

        transaction.add(SystemProgram.transfer({
            fromPubkey : publicKey,
            toPubkey : new PublicKey(tcxData.to),
            lamports : tcxData.amount * LAMPORTS_PER_SOL
        }));

        await sendTransaction(transaction, connection);
        
        toast.success(`Transaction successfull: Sent ${tcxData.amount} SOL`);
        updateBalance((prev)=> prev - (tcxData.amount * LAMPORTS_PER_SOL));

       }catch(err){
        
        console.error(err);
        toast.error("Faild to send Solana");
       }finally{
         setSending(false);
       }
    }
    
    const handleChange = (e)=>{
        setTcxData((prev)=> {
            return {...prev, [e.target.name] : e.target.value }
        })
    }

    return ( 
        <>
        <div>
            <div className="flex flex-col gap-3 justify-center items-center">
                <input 
                 type="text" 
                 className="bg-black/60 py-2 px-3 rounded-md w-full" 
                 placeholder="Enter reciever's wallet address"
                 name="to"
                 value={tcxData.to}
                 onChange={handleChange}
                />
                
                <div className="flex gap-3 justify-center w-full">

                    <input 
                     type="number" 
                     className="bg-black/60 py-2 px-3 rounded-md w-full flex-2" 
                     placeholder="Enter SOL amount"
                     name="amount"
                     value={tcxData.amount}
                     onChange={handleChange}
                     onFocus={(e)=> e.target.select()}
                    />
                    
                    <button type="submit" onClick={initTransaction}>
                        {sending? "sending..." : "send"}
                    </button>
                </div>
            </div>
        </div>
        </>
    )
}