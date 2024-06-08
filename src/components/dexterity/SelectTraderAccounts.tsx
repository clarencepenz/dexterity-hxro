import React, { FC, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useManifest, useTrader, useProduct } from 'contexts/DexterityProviders';
import { PublicKey } from '@solana/web3.js';
import { notify } from "../../utils/notifications";
import { formatPubKey, handleCopy } from 'utils/util';
import Button from '../Button';
import { dexterity, TraderAccount, TraderAccountDropdownProps } from '../../utils/dexterityTypes';

export const SelectTraderAccounts: FC = () => {
    const { publicKey } = useWallet();
    const { manifest } = useManifest();
    const [trgsArr, setTrgsArr] = useState<TraderAccount[]>([]);
    const [selectedTrg, setSelectedTrg] = useState<string>('');
    const { setTrader } = useTrader()
    const { mpgPubkey } = useProduct()

    useEffect(() => {
        fetchTraderAccounts();
    }, [publicKey, manifest]);

	const fetchTraderAccounts = useCallback(async () => {
	        if (!publicKey) {console.log('publicKey error');return};
	        if (!manifest) {console.log('manifest error');return};
	        if (!manifest.fields) {console.log('manifest.fields error');return};
	        if (!manifest.fields.wallet.publicKey) {console.log('manifest.fields.wallet.publicKey error');return};
	
	        try {
	
					const owner = publicKey
					const marketProductGroup = new PublicKey(mpgPubkey)
					const trgs = await manifest.getTRGsOfOwner(owner, marketProductGroup)
					setTrgsArr(trgs)
	
	        } catch (error: any) {
	            notify({ type: 'error', message: `Selecting Trader Account failed!`, description: error?.message });
	        }
	
	    }, [publicKey, manifest]);
	
	const handleCreateTRG = useCallback(async () => {
	        try {
	
	            const marketProductGroup = new PublicKey(mpgPubkey)
							await manifest.createTrg(marketProductGroup)
	
	            fetchTraderAccounts();
	        } catch (error: any) {
	            notify({ type: 'error', message: `Creating Trader Account failed!`, description: error?.message });
	        }
	    }, [fetchTraderAccounts, manifest]);
	
	const handleSelection = useCallback(async (selectedTrgPubkey: string) => {
	        if (selectedTrgPubkey == "default") return;
	
	        const trgPubkey = new PublicKey(selectedTrgPubkey)
	        const trader = new dexterity.Trader(manifest, trgPubkey)
	
					await trader.update()
	
					const marketProductGroup = new PublicKey(mpgPubkey)
					await manifest.updateOrderbooks(marketProductGroup)
	
					setTrader(trader)
	
	    }, [manifest, setTrader]);


    return (
	    <div className="md:hero mx-auto p-4">
	      <div className="md:hero-content flex flex-col">
	        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br  from-[#80ff7d] to-[#80ff7d] mt-10 mb-8">
	          Basics
	        </h1>
	        <div className="text-center">
	          <DefaultInfo />
	          <SelectTraderAccounts />
						{/*Right under here*/}
	          {trader && (
	            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
	              <div className="col-span-1 md:col-span-1 lg:col-span-1">
	                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                  <div>
	                    <PlaceLimitOrder />
	                  </div>
	                  <div>
	                    <FundingTrader />
	                  </div>
	                </div>
	                <div className="mt-4">
	                  <OpenOrders />
	                </div>
	              </div>
	              <div className="col-span-1 md:col-span-1 lg:col-span-1 gap-4">
	                <div className="mt-4">
	                  <AccountInfo />
	                </div>
	              </div>
	            </div>
	          )}
	        </div>
	      </div>
	    </div>
    );
};

const TraderAccountDropdown: FC<TraderAccountDropdownProps> = ({ accounts, onSelect }) => {
    return (
        <select onChange={(e) => onSelect(e.target.value)} className='text-black text-xl'>
            <option value="default">Select a Trader Account</option>
            {accounts.map((trg, index) => (
                <option key={index} value={trg.pubkey.toBase58()}>{formatPubKey(trg.pubkey.toBase58())}</option>
            ))}
        </select>
    );
};
