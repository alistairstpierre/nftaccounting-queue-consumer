import { CovalentItem, Transaction } from "../../../../../../interfaces"
import { exchange, tx_type } from "../../../../../../util/nft-constants";
import { create_transaction, log_types } from "../../../../../helpers";

export function create_seaport_multi_transaction(item: CovalentItem): Transaction[] {
  const transactions: Transaction[] = [];
  const purchaser = item.from_address.toLowerCase();
  const type = purchaser == global.walletAddress ? tx_type.OPENSEA_MULTI_PURCHASE : tx_type.OPENSEA_MULTI_SALE;

  let trades = 0;
  const tokenIds:string[] = [];
  item.log_events.forEach((tx) => {
    if (tx.decoded?.name == log_types.TRANSFER){
        trades++;
        tokenIds.push(tx.decoded.params.find((param) => param.name == "tokenId")?.value);
    } 
  });

  if(type == tx_type.OPENSEA_MULTI_PURCHASE) {  
    for (let i = 0; i < trades; i++) {
      const tx = create_transaction(
        type,
        item.tx_hash,
        item.block_signed_at,
        typeof item.fees_paid == "string" ? parseInt(item.fees_paid) / trades : item.fees_paid / trades,
        parseFloat(item.value) / trades,
        item.log_events[0]?.sender_name,
        item.log_events[0]?.sender_address,
        tokenIds[i],
        exchange.OPENSEA
      );
      transactions.push(tx);
    }
  }
  else {
    item.log_events.forEach((tx) => {
        if(tx.decoded?.name == log_types.TRANSFER) {
            const seller = tx.decoded.params.find((param) => param.name == "from")?.value;
            if(seller.toLowerCase() == global.walletAddress){
                const temp = create_transaction(
                    type,
                    item.tx_hash,
                    item.block_signed_at,
                    0,
                    parseFloat(item.value) / trades,
                    item.log_events[0]?.sender_name,
                    item.log_events[0]?.sender_address,
                    tx.decoded.params.find((param) => param.name == "tokenId")?.value,
                    exchange.OPENSEA
                  );
                  transactions.push(temp);
            }
        }
    });
  }

  return transactions;
}
