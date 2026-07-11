import { useEffect, useState } from "react";
import AirDrop from "./AirDrop";
import SignMessage from "./SignMessage";
import SendSol from "./SendSol";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Token from "./Token";

export default function Layout() {

    const [openTab, setOpenTab] = useState(0);
    const [balance, setBalance] = useState(0);

    const wallet = useWallet();
    const {connection} = useConnection ();
    const currBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);


      useEffect(() => {
        const fetchBalance = async () => {
          if (!wallet.connected || !connection) {
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
        
      }, [wallet, connection]);
    
    const tabs = [{
        name: "Airdrop",
        component: <AirDrop updateBalance={setBalance} balance={balance} />
    },
    {
        name: "Sign Message",
        component: <SignMessage />
    },
    {
        name: "Send SOL",
        component : <SendSol updateBalance={setBalance} />
    },
    {
        name: "Token",
        component : <Token />
    }
]

    return (
        <div className="rounded-xl" >
            <div className="flex gap-6 justify-center items-baseline mb-4">
                <h1 className="text-2xl">Your Balance : </h1>
                <div className="font-semibold flex gap-2 items-end-safe mb-5 ">
                    <span className="text-4xl">{wallet.connected ? currBalance : 0}</span>
                    <span className="text-sm">SOL</span>
                </div>
            </div>

            <div className="bg-black/30 py-2 px-2 rounded-2xl flex gap-3 justify-evenly mb-10">
                
                {tabs.map((t, idx)=> (
                    <span 
                    key={idx} 
                    className={`font-semibold ${openTab==idx && "bg-neutral-800/70"} hover:cursor-pointer py-2 px-5 rounded-xl`}
                    onClick={()=> setOpenTab(idx)}
                    > 
                        {t.name}
                    </span>
                ))}

            </div>

           {
            tabs[openTab].component
           }

        </div>
    );
}