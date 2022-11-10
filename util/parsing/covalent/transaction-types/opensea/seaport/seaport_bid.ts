import { CovalentItem, Transaction } from "../../../../../../interfaces"
import { exchange, tx_type } from "../../../../../../util/nft-constants";
import { create_transaction } from "../../../../../helpers";

export function create_seaport_bid_transaction(item: CovalentItem): Transaction {
  const purchaser = item.log_events[0]?.decoded?.params[0]?.value.toString().toLowerCase();
  const seller = item.log_events[0]?.decoded?.params[1]?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.OPENSEA_BID_PURCHASE : tx_type.OPENSEA_BID_SALE;
  if (type == tx_type.OPENSEA_BID_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }

  let total_value = 0;
  item.log_events.forEach((event) => {
    const value = event.decoded?.params.find((i) => i.name == "value")?.value;
    if (value != null) total_value += parseInt(value);
  });

  return create_transaction(
    type,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == "string" ? parseInt(item.fees_paid) : item.fees_paid,
    total_value,
    item.log_events[3]?.sender_name,
    item.log_events[3]?.sender_address,
    undefined,
    exchange.OPENSEA
  );
}
