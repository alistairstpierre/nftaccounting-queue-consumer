import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";
import { create_looksrare_bid_transaction } from "./lr_bid";
import { create_looksrare_buynow_eth_transaction } from "./lr_buynow_eth";
import { create_looksrare_buynow_weth_transaction } from "./lr_buynow_weth";

export function is_looksrare_transaction(item: CovalentItem): boolean {
  if (get_marketplace(item.to_address) != exchange.LOOKSRARE.toLowerCase()) {
    return false;
  }
  return true;
}

export function create_looksrare_transaction(
  item: CovalentItem
): Transaction {
  if (item.log_events[0]?.decoded?.name == log_types.TAKERBID)
    return create_looksrare_buynow_weth_transaction(item)
  else if (item.log_events[2]?.decoded?.name == log_types.TAKERBID)
    return create_looksrare_buynow_eth_transaction(item)
  else if (item.log_events[0]?.decoded?.name == log_types.TAKERASK)
    return create_looksrare_bid_transaction(item)
  else 
    console.log("unidentified looksrare tx")
  return <Transaction>{};
}
