import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_looksrare_bid_transaction(item: CovalentItem): Transaction {
  const purchaser = item.log_events[0]?.decoded?.params[3]?.value.toString().toLowerCase();
  const seller = item.log_events[0]?.decoded?.params[2]?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.LOOKSRARE_BID_PURCHASE : tx_type.LOOKSRARE_BID_SALE;
  if (type == tx_type.LOOKSRARE_BID_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }

  const price: string = item.log_events[0]?.decoded?.params.find((i) => i.name == "price")?.value;

  let id: string | undefined = undefined;
  id = item.log_events[0]?.decoded?.params.find((i) => i.name == "tokenId")?.value;

  return create_transaction(
    type,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == "string" ? parseInt(item.fees_paid) : item.fees_paid,
    parseInt(price),
    item.log_events[5]?.sender_name,
    item.log_events[5]?.sender_address,
    id,
    exchange.LOOKSRARE
  );
}
