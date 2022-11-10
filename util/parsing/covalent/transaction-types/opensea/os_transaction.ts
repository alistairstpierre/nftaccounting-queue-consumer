import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { get_marketplace, log_types } from "../../../../helpers";
import { create_opensea_bid_transaction } from "./os_bid";
import { create_opensea_bundle_transaction } from "./os_buynow_bundle";
import { create_opensea_buynow_transaction } from "./os_buynow";
import { create_opensea_bid_bundle_transaction } from "./os_bid_bundle";
import { create_seaport_transaction } from "./seaport/seaport_transaction";
import { create_opensea_cancelled_listing } from "./os_cancelled_listing";
import { create_opensea_register_expense } from "./os_register_expense";
import { create_opensea_failed_purchase } from "./os_failed_purchase";

export function is_opensea_transaction(item: CovalentItem): boolean {
  if (get_marketplace(item.to_address) != exchange.OPENSEA) {
    return false;
  }
  return true;
}

export function create_opensea_transaction(item: CovalentItem): Transaction[] {
  const transactions: Transaction[] = [];
  if (item.to_address == marketplaceDetails.find((m) => m.marketplace == exchange.OPENSEA)?.exchangeContracts.Seaport)
    create_seaport_transaction(item).forEach((tx) => {
      transactions.push(tx);
    });
  else if (parseInt(item.value) == 0) {
    if (item.log_events.length > 5)
      create_opensea_bid_bundle_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    else if (item.log_events.length == 5 || item.log_events.length == 4) transactions.push(create_opensea_bid_transaction(item));
    else if (item.log_events.length == 1 && item.log_events[0]?.decoded?.name == log_types.ORDER_CANCELLED)
      transactions.push(create_opensea_cancelled_listing(item));
    else if (item.log_events.length == 1 && item.log_events[0]?.decoded?.name == log_types.UPGRADED)
      transactions.push(create_opensea_register_expense(item));
    else console.log("Undefined opensea transaction with value 0: ", item.tx_hash);
  } else if (item.log_events[0]?.decoded?.name == log_types.ORDERS_MATCHED) {
    if (item.log_events.length > 3)
      create_opensea_bundle_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    else transactions.push(create_opensea_buynow_transaction(item));
  } else if (item.successful == false) {
    transactions.push(create_opensea_failed_purchase(item));
  } else {
    console.log("Undefined opensea transaction ", item.tx_hash);
  }
  return transactions;
}
