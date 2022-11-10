import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_x2y2_bundle_transaction(item: CovalentItem): Transaction[] {
  const transactions: Transaction[] = [];
  const purchaser = item.from_address.toLowerCase();
  const seller = item.log_events[8]?.decoded?.params[0]?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.X2Y2_BUYNOW_PURCHASE : tx_type.X2Y2_BUYNOW_SALE;
  if (type == tx_type.X2Y2_BUYNOW_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }

  let amount = 0;
  item.log_events.forEach((event) => {
    const value = event.decoded?.params.find((i) => i.name == "from")?.value;
    if (value == seller) amount++;
  });
  amount = amount / 2;

  let price = item.value;
  if (price == "0") price = item.log_events[item.log_events.length - 1]?.decoded?.params.find((i) => i.name == "value")?.value;

  for (let i = 0; i < amount; i++) {
    let id: string | undefined = undefined;
    if (item.log_events[2 * i] != undefined) id = item.log_events[2 * i]?.decoded?.params.find((i) => i.name == "tokenId")?.value;
    transactions.push(
      create_transaction(
        type,
        item.tx_hash,
        item.block_signed_at,
        typeof item.fees_paid == "string" ? parseFloat(item.fees_paid) / amount : item.fees_paid / amount,
        parseFloat(price) / amount,
        item.log_events[0]?.sender_name,
        item.log_events[0]?.sender_address,
        id,
        exchange.X2Y2
      )
    );
  }
  return transactions;
}
