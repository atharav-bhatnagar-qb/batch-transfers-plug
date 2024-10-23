import { useState } from 'react';
import { batchTransfer_backend } from 'declarations/batchTransfer_backend';
import {idlFactory} from '../../declarations/batchTransfer_backend'
import {idlFactory as ledgerIDL} from '../../declarations/ledger.did.js'
import { Principal } from '@dfinity/principal';

function App() {
  const [principal, setprincipal] = useState('');
  const [actors,setActors] = useState(null)
  const [balances,setBalances]=useState([0,0,0])
  const ledgers=["ryjl3-tyaaa-aaaaa-aaaba-cai","mxzaz-hqaaa-aaaar-qaada-cai","ss2fx-dyaaa-aaaar-qacoq-cai"]
  const receiver="swldj-h3c5k-be3yy-n4dbk-nxiyp-6kt4u-rgrvw-yt62l-buym5-pqlpl-vqe"

  async function plugLogin() {
    try {
      const connected = await window.ic.plug.isConnected();
      const whitelist= [process.env.CANISTER_ID_BATCHTRANSFER_BACKEND,...ledgers]
      await window.ic.plug.requestConnect({ whitelist });
      console.log("connected!")
      const backendActor = await window.ic.plug.createActor({
        canisterId: whitelist[0],
        interfaceFactory: idlFactory,
      });
      const IcpActor = await window.ic.plug.createActor({
        canisterId: whitelist[1],
        interfaceFactory: ledgerIDL,
      });
      const btcActor = await window.ic.plug.createActor({
        canisterId: whitelist[2],
        interfaceFactory: ledgerIDL,
      });
      const ethActor = await window.ic.plug.createActor({
        canisterId: whitelist[3],
        interfaceFactory: ledgerIDL,
      });
      console.log("actor created : ",backendActor)
      const principal=await backendActor.whoami()
      console.log(principal)
      setprincipal(principal)
      setActors({
        backendActor,
        btcActor,
        IcpActor,
        ethActor
      })
    } catch (err) {
      console.log("login err : ",err)
    }
  }

  async function getBalances(){
    try{
      const ICPbalance=parseInt(await actors.IcpActor.icrc1_balance_of({owner:Principal.fromText(principal),subaccount:[]}))
      const BTCbalance=parseInt(await actors.btcActor.icrc1_balance_of({owner:Principal.fromText(principal),subaccount:[]}))
      const ETHbalance=parseInt(await actors.ethActor.icrc1_balance_of({owner:Principal.fromText(principal),subaccount:[]}))
      console.log([ICPbalance,BTCbalance,ETHbalance])
      setBalances([ICPbalance,BTCbalance,ETHbalance])
    }catch(err){
      console.log("get balance err : ",err)
    }
  }
  async function batchTransaction(){
    try {
      const TRANSFER_ICP = {
        idl: ledgerIDL,
        canisterId: ledgers[0],
        methodName: 'icrc1_transfer',
        args: [
          {   to: {owner:Principal.fromText(receiver),subaccount:[]},
              fee:[],
              amount: BigInt(1400000),
              memo:[],
              from_subaccount:[],
              created_at_time:[]
            }
          ],
        onSuccess: async (res) => {
          console.log('transferred icp successfully');
        },
        onFail: (res) => {
          console.log('transfer icp error', res);
        },
      };
      const TRANSFER_CKBTC = {
        idl: ledgerIDL,
        canisterId: ledgers[1],
        methodName: 'icrc1_transfer',
        args: [
          {   to: {owner:Principal.fromText(receiver),subaccount:[]},
              fee:[],
              amount: BigInt(1400000),
              memo:[],
              from_subaccount:[],
              created_at_time:[]
            }
          ],
        onSuccess: async (res) => {
          console.log('transferred ckbtc successfully');
        },
        onFail: (res) => {
          console.log('transfer ckbtc error', res);
        },
      };
      const TRANSFER_CKETH = {
        idl: ledgerIDL,
        canisterId: ledgers[2],
        methodName: 'icrc1_transfer',
        args: [
          {   to: {owner:Principal.fromText(receiver),subaccount:[]},
              fee:[],
              amount: BigInt(1400000),
              memo:[],
              from_subaccount:[],
              created_at_time:[]
            }
          ],
        onSuccess: async (res) => {
          console.log('transferred cketh successfully');
        },
        onFail: (res) => {
          console.log('transfer cketh error', res);
        },
      };
      await window.ic.plug.batchTransactions([TRANSFER_ICP, TRANSFER_CKBTC, TRANSFER_CKETH,`FLIP_TRANSACTION(1)`])
    } catch (err) {
      console.log("batchTransaction err : ",err)
    }
  }

  return (
    <main>
      <br />
      <br />
      <h1>Batch transaction example</h1>
      <button onClick={plugLogin}>Authenticate with plug</button>
      <button onClick={batchTransaction}>Call batch transfer</button>
      <button onClick={getBalances}>Get balances</button>
      <p>{principal}</p>
      <p>ICP balance : {balances[0]}</p>
      <p>ckBTC balance : {balances[1]}</p>
      <p>ckETH balance : {balances[2]}</p>
    </main>
  );
}

export default App;
