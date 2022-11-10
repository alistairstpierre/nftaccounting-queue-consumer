import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_opensea_bid_bundle_transaction(item: CovalentItem): Transaction[] {
    const transactions:Transaction[] = []

    const total_value = parseFloat(item.log_events[0]?.decoded?.params.find(i => i.name == "price")?.value)

    const purchaser = item.log_events[0]?.decoded?.params[2]?.value
      .toString()
      .toLowerCase();
    const seller = item.log_events[0]?.decoded?.params[3]?.value
      .toString()
      .toLowerCase();
    let type =
      purchaser == global.walletAddress
        ? tx_type.OPENSEA_BID_BUNDLE_PURCHASE
        : tx_type.OPENSEA_BID_BUNDLE_SALE;
    if (
      type == tx_type.OPENSEA_BID_BUNDLE_SALE &&
      seller != global.walletAddress
    ) {
      type = tx_type.ERROR;
    }

    let trades = 0
    item.log_events.forEach(tx => {
        if(tx.decoded?.name === log_types.APPROVAL){
            trades++;
        }
    });

    for(let i = 0; i < trades; i++) {
        const tx:Transaction = create_transaction(
            type,
            item.tx_hash,
            item.block_signed_at,
            typeof item.fees_paid == 'string' ? parseInt(item.fees_paid)/trades : item.fees_paid/trades,
            total_value/trades,
            item.log_events[1]?.sender_name,
            item.log_events[1]?.sender_address,
            undefined,
            exchange.OPENSEA,
          );
      
          transactions.push(tx)
    }
    return transactions;
}