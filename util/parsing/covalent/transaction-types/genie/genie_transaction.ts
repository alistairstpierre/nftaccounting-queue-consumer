
import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";
import { create_genie_purchase } from "./genie_purchase";
import { create_genie_sale } from "./genie_sale";

export function is_genie_transaction(item: CovalentItem): boolean {
  if (get_marketplace(item.to_address) != exchange.GENIE.toLowerCase()) {
    return false;
  }
  return true;
}

export function create_genie_transaction(item: CovalentItem): Transaction[] {
  for (const event of item.log_events) {
    if(event.decoded?.name == log_types.TRANSFER){
      // In event.decoded.params find the param where "name" = "from" then get the "value" from that param
      const address = event.decoded.params.find(param => param.name == "from")?.value;
      if(address.toLowerCase() == global.walletAddress){
        // console.log("GENIE SALE") 
        return create_genie_sale(item);
      }
    }
  }
  // transaction is a purchase
  // console.log("GENIE PURCHASE") 
  return create_genie_purchase(item);
}
