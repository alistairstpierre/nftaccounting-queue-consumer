import { CovalentItem, Transaction } from "../../../../../../interfaces"
import { create_seaport_bid_transaction } from "./seaport_bid";
import { create_seaport_bid_bundle_transaction } from "./seaport_bid_bundle";
import { create_seaport_buynow_transaction } from "./seaport_buynow";
import { create_seaport_buynow_bundle_transaction } from "./seaport_buynow_bundle";
import { create_seaport_multi_transaction } from "./seaport_multi";

export function create_seaport_transaction(item: CovalentItem): Transaction[] {
  const transactions: Transaction[] = [];
  if (parseInt(item.value) == 0) {
    if(item.log_events[0]?.decoded == null) {
        create_seaport_bid_bundle_transaction(item).forEach(tx => {
            transactions.push(tx);
        });
    }
    else
        transactions.push(create_seaport_bid_transaction(item))
  } else {
    if(item.log_events[0]?.decoded == null) {
        create_seaport_buynow_bundle_transaction(item).forEach(tx => {
            transactions.push(tx);
        });
    }
    else
        if(item.log_events.length > 2){
            create_seaport_multi_transaction(item).forEach(tx => {
                transactions.push(tx);
            });
        } 
        else transactions.push(create_seaport_buynow_transaction(item));
  } 
  return transactions;
}
