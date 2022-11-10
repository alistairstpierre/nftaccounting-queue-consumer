import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";
import { create_x2y2_bundle_transaction } from "./x2y2_bundle";
import { create_x2y2_buynow_eth_transaction } from "./x2y2_buynow_eth";
import { create_x2y2_buynow_weth_transaction } from "./x2y2_buynow_weth";

export function is_x2y2_transaction(item: CovalentItem): boolean {
  if (get_marketplace(item.to_address) != exchange.X2Y2.toLowerCase()) {
    return false;
  }
  return true;
}

export function create_x2y2_transaction(
  item: CovalentItem
): Transaction[] {
  const transactions: Transaction[] = [];
  const value = typeof item.value == 'string' ? parseInt(item.value) : item.value
  if(item.log_events[0]?.decoded != null){
    create_x2y2_bundle_transaction(item).forEach(tx => {
      transactions.push(tx);
    });
  }else {
    if(value == 0){
      transactions.push(create_x2y2_buynow_weth_transaction(item))
    }else {
      transactions.push(create_x2y2_buynow_eth_transaction(item))
    }
  }
  return transactions;
}
