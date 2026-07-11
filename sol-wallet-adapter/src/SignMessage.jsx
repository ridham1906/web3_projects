import { useWallet } from "@solana/wallet-adapter-react";
import { ed25519 } from "@noble/curves/ed25519.js";
import bs58 from "bs58";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SignMessage() {
    
    const { signMessage, publicKey} = useWallet();
    const [msg, setMsg] = useState("");
    const [signature, setSignature] = useState("");
    const [isSigning, setIssigning] = useState(false);

    useEffect(()=> {
        if(!publicKey) return toast.warning("Connect Wallet first to sign message");
        if(!signMessage) return toast.error("Your wallet doesn't support message signing!")
    }, [publicKey, signMessage])

    const signMsg = async ()=> {
        if(!publicKey) return toast.error("Connect wallet first");
        if(!signMessage) return toast.error("Your wallet doesn't support message signing!")
        
        try{
            setIssigning(true);

            const encodedMsg = new TextEncoder().encode(msg);
            const signature = await signMessage(encodedMsg);    

            if(!ed25519.verify(signature, encodedMsg, publicKey.toBytes())){
                return toast.error("Message Signature Invalid!")
            }
            
            const encodedSignature = bs58.encode(signature);
            console.log(encodedSignature);

            setSignature(encodedSignature);
        
        }catch(err){
            console.error(err);
            return toast.error("Signing failed!")
        }finally{
            setIssigning(false);
        }
    }

    return (
        <div className="flex flex-col gap-5 justify-center items-center relative space-y-3">
            <div className="flex gap-3 justify-center items-center w-full">
                <input 
                    type="text"
                    placeholder="Type your message here..."
                    className="py-2.5 px-3 bg-black/60 rounded-md flex-2"
                    onChange={(e)=> setMsg(e.target.value)}
                    value={msg}
                    />

                <button onClick={signMsg}> 
                    Sign 
                </button>
            </div>

            <span className="absolute top-15">
                {
                    signature ? signature : 
                    !signature && isSigning ? "signing your message..." :
                    "No singature yet!"
                }
            </span>
        </div>
    );
}