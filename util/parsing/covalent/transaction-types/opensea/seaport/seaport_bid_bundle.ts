import { CovalentItem, Transaction } from "../../../../../../interfaces"
import { exchange, tx_type } from "../../../../../../util/nft-constants";
import { create_transaction, log_types } from "../../../../../helpers";

export function create_seaport_bid_bundle_transaction(item: CovalentItem): Transaction[] {
  const transactions: Transaction[] = [];
  const purchaser = item.log_events[3]?.decoded?.params[1]?.value.toString().toLowerCase();
  const seller = item.log_events[3]?.decoded?.params[0]?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.OPENSEA_BID_BUNDLE_PURCHASE : tx_type.OPENSEA_BID_BUNDLE_SALE;
  if (type == tx_type.OPENSEA_BID_BUNDLE_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }

  let trades = 0;
  item.log_events.forEach((tx) => {
    if (tx.decoded?.name == log_types.APPROVAL) trades++;
  });

  const price = item.log_events[1]?.decoded?.params.find((i) => i.name == "value")?.value;

  for (let i = 0; i < trades; i++) {
    const tx = create_transaction(
      type,
      item.tx_hash,
      item.block_signed_at,
      typeof item.fees_paid == "string" ? parseInt(item.fees_paid) / trades : item.fees_paid / trades,
      parseFloat(price) / trades,
      item.log_events[3]?.sender_name,
      item.log_events[3]?.sender_address,
      undefined,
      exchange.OPENSEA
    );
    transactions.push(tx);
  }
  return transactions;
}
