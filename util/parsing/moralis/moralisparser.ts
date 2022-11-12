import { MoralisItem, Transaction } from "../../../interfaces";
import { weiToEth } from "../../../util/helpers";
import { purchase_type, tx_type } from "../../nft-constants";

export function moralis_parse(data: MoralisItem[], transactions: Transaction[]) {
  const startTime = performance.now();
  transactions.forEach((tx) => {
    const match = data.find((entry) => entry.transaction_hash === tx.tx_hash);
    if (match != undefined) {
      const moralis_occurances = data.filter((entry) => entry.transaction_hash === tx.tx_hash)
      if (moralis_occurances.length > 1) {
        // check to see how many times transaction hash appears in moralis transactions
        const covalent_occurances = transactions.filter((entry) => entry.tx_hash === tx.tx_hash);
        let count = 0;
        for (let i = 0; i < covalent_occurances.length; i++) {
          if (covalent_occurances[i]?.token_ID != undefined) {
            count++;
          }
        }
        if (count < covalent_occurances.length) {
          tx.token_ID = moralis_occurances[count]?.token_id;
        }
        // save 1 transaction to the transactions array
        tx.collection_address = match.token_address;
        tx.contract = match.contract_type;
        // if there are multiple transactions add them to another array to be added after the parsing
      } else {
        if (tx.price == undefined) tx.price = typeof match.value == "string" ? weiToEth(parseFloat(match.value)) : undefined;
        if (tx.token_ID == undefined) tx.token_ID = match.token_id;
        tx.collection_address = match.token_address;
        tx.contract = match.contract_type;
      }
      // TODO if collection name is undefined, get the collection address from a moralis api call
      // if (tx.collection_name === undefined) {
      //   tx.collection_name = fetch_moralis_contract_data(match.tokenAddress);
      // }
    }
  });
  // transactions.forEach((tx) => {
  //   if(purchase_type.includes(tx.type)) console.log(tx.collection_name, tx.token_ID);
  // });
  const endTime = performance.now();
  console.log(`Parse Moralis took ${endTime - startTime} milliseconds`);
  return transactions;
}
