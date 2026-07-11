import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import 
{ 
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress, 
    createTransferInstruction, 
    createAssociatedTokenAccountInstruction 
} from "@solana/spl-token";

import { TokenListProvider } from "@solana/spl-token-registry";
import { PublicKey, Transaction } from "@solana/web3.js";
import toast from "react-hot-toast";

export default function Token() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const {publicKey} = wallet;

    const [tokenAccounts, setTokenAccounts] = useState([]);
    const [tokenList, setTokenList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's token accounts
    useEffect(() => {
        if (!publicKey || !connection) {
            toast.error("Connect your wallet to view token accounts");
            return;
        }

        fetchTokenAccounts();

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, connection]);

    const fetchTokenAccounts = async () => {
        try {
            const response =
                await connection.getParsedTokenAccountsByOwner(
                    publicKey,
                    {
                        programId: TOKEN_PROGRAM_ID,
                    }
                );

            setTokenAccounts(response.value);
        } catch (err) {
            console.error("Failed to fetch token accounts:", err);
        }
    };


    // Load token registry only once
    useEffect(() => {
        const loadRegistry = async () => {
            try {
                const tokens = await new TokenListProvider().resolve();
                setTokenList(tokens.getList());
            } catch (err) {
                console.error("Failed to load token registry:", err);
            } finally {
                setLoading(false);
            }
        };

        loadRegistry();
    }, []);

    // Merge balances with metadata
    const tokensWithMetadata = useMemo(() => {
        return tokenAccounts.map((token) => {
            const mint = token.account.data.parsed.info.mint;

            const metadata = tokenList.find(
                (t) => t.address === mint
            );

            return {
                mint,
                balance:
                    token.account.data.parsed.info.tokenAmount.uiAmount,
                decimals:
                    token.account.data.parsed.info.tokenAmount.decimals,
                metadata,
            };
        });
    }, [tokenAccounts, tokenList]);

    if (!publicKey) {
        return (
            <div className="text-center mt-10">
                Connect your wallet
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center mt-10">
                Loading...
            </div>
        );
    }

    return (
        <>
        <SendToken tokens={tokensWithMetadata} connection={connection} wallet={wallet} updateTokenBalance={fetchTokenAccounts} />
        <div className="space-y-4 mt-6 overflow-y-auto">
            <h2 className="text-xl font-bold">Your Tokens</h2>

            {tokensWithMetadata.length === 0 ? (
                <p>No SPL Tokens Found</p>
            ) : (
                tokensWithMetadata.map((token) => (
                    <div
                    key={token.mint}
                    className="flex items-center gap-4 rounded-lg border p-4"
                    >
                        {token.metadata?.logoURI ? (
                            <img
                                src={token.metadata.logoURI}
                                alt={token.metadata.symbol}
                                className="w-10 h-10 rounded-full"
                            />):(
                            <span className="p-4 rounded-full bg-neutral-700"> UK </span>
                        )}

                        <div>
                            <h3 className="font-semibold">
                                {token.metadata?.symbol || "Unknown Token"}
                            </h3>

                            <p>{token.metadata?.name}</p>

                            <p>
                                Balance: {token.balance}
                            </p>

                            <p className="text-xs break-all">
                                {token.mint}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
        </>
    );
}

const SendToken = ({tokens, connection, wallet, updateTokenBalance}) => {

    const {publicKey} = wallet;

    const [tcxData, setTcxData] = useState({
        to: "",
        mint: "",
        amount: 0
    });
    const [token, setToken] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const getATA = async(mint, pubKey)=> {
        return await getAssociatedTokenAddress(mint, pubKey);
    }   

    const handleChange = (e)=> {
        setTcxData((prev)=> {
            return {...prev, [e.target.name]: e.target.value}
        })

        if(e.target.name === "mint"){
            setToken(tokens.find((t)=> t.mint === e.target.value));
        }
    }

    const processTcx = async()=> {

        if(tcxData.amount == 0 || !tcxData.mint || !tcxData.to) return toast.error("Fill the details");

        setIsSending(true);
        try{
            const mint = new PublicKey(tcxData.mint);
            const reciever = new PublicKey(tcxData.to);
            
            const senderATA = await getATA(mint, publicKey);
            const recieverATA = await getATA(mint, reciever);
            
            const transaction = new Transaction;
            
            const recieverAccount = await connection.getAccountInfo(recieverATA);
            
            if(!recieverAccount){
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        publicKey,
                        recieverATA,
                        reciever,
                        mint
                    )   
                );
            }
            
            const amount = tcxData.amount * Math.pow(10, token.decimals);
            transaction.add(
                createTransferInstruction(
                    senderATA,
                    recieverATA,
                    publicKey,
                    amount
                )
            )

           const signature = await wallet.sendTransaction(transaction, connection);
          
            let status = null;

            while (!status) {
                const result = await connection.getSignatureStatus(signature);

                status = result.value?.confirmationStatus;

                if (!status) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            alert(`Signature: ${signature}\nStatus: ${status}`);

            toast.success("Transaction successful");
            await updateTokenBalance();

        }catch(err){
            console.error(err);
            toast.error("Transaction Failed");
        }finally{
            setIsSending(false);
        }
    }

    return(
        <>
        <div className="flex flex-col gap-3 justify-center items-center relative">
            <select name="mint" id="token-mint" 
                className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-md px-3 py-2 appearance-none"
                onClick={handleChange}
            >  
                <option value="none">Select token to send</option>
                {tokens?.map((t, idx)=> (
                    <option key={idx} value={t.mint}> 
                        {!t.metadata ?  `unknown token ${idx}` : t.metadata.name} 
                    </option>
                ))}
            </select>

            <input 
                type="text"
                name="to"
                placeholder="Enter the reciever's wallet address"
                value={tcxData.to}
                onChange={handleChange}
                className="bg-zinc-900 rounded-md py-2 px-3 w-full"
            />

            <div className="flex justify-center gap-4 items-center w-full">
                <input 
                    type="number"
                    name="amount"
                    value={tcxData.amount}
                    onChange={handleChange}
                    placeholder="Enter token amount to send"
                    className="bg-zinc-900 rounded-md py-2 px-3 flex-1"
                    onFocus={(e)=> e.target.select()}
                />
                <button onClick={processTcx}> {isSending ? "sending..." : "send"} </button>
            </div>
        </div>
        </>
    )
}