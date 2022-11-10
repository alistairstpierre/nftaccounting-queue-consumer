
import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange } from "../../../../../util/nft-constants";
import { get_marketplace, log_types } from "../../../../helpers";
import { create_gem_purchase } from "./gem_purchase";
import { create_gem_sale } from "./gem_sale";

export function is_gem_transaction(item: CovalentItem): boolean {
  if (get_marketplace(item.to_address) != exchange.GEM.toLowerCase()) {
    return false;
  }
  return true;
}

export function create_gem_transaction(item: CovalentItem): Transaction[] {
    // Get the data from moralis first so we know how many transactions there were
    // Check if the transaction is a purchase or sale
    for (const event of item.log_events) {
      if(event.decoded?.name == log_types.TRANSFER){
        // In event.decoded.params find the param where "name" = "from" then get the "value" from that param
        const address = event.decoded.params.find(param => param.name == "from")?.value;
        if(address.toLowerCase() == global.walletAddress){
          // console.log("GEM SALE") 
          return create_gem_sale(item);
        }
      }
    }
    // transaction is a purchase
    // console.log("GEM PURCHASE") 
    return create_gem_purchase(item);
}
