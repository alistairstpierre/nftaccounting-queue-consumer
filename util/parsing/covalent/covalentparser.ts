import { CovalentItem, Transaction } from "../../../interfaces";
//import { create_cancelled_transaction, is_cancelled_transaction } from "./transaction-types/cancelled";
import { create_failed_transaction, is_failed_transaction } from "./transaction-types/failure";
import { create_gem_transaction, is_gem_transaction } from "./transaction-types/gem/gem_transaction";
import { create_genie_transaction, is_genie_transaction } from "./transaction-types/genie/genie_transaction";
import { create_listing_transaction, is_listing_transaction } from "./transaction-types/listing";
import { create_looksrare_transaction, is_looksrare_transaction } from "./transaction-types/looksrare/lr_transaction";
import { create_mint_transaction, is_mint_transaction } from "./transaction-types/mint";
import { create_opensea_transaction, is_opensea_transaction } from "./transaction-types/opensea/os_transaction";
import { is_other } from "./transaction-types/other";
import { create_x2y2_transaction, is_x2y2_transaction } from "./transaction-types/x2y2/x2y2_transaction";

export function parse(data: CovalentItem[]) {
  const startTime = performance.now();
  global.is_parsing_covalent = true;
  const uncaughtData: CovalentItem[] = [];
  const transactions = <Transaction[]>[];
  data.forEach((item) => {
    if (is_failed_transaction(item)) {
      transactions.push(create_failed_transaction(item));
    } else if (is_mint_transaction(item)) {
      create_mint_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    } else if (is_listing_transaction(item)) {
      transactions.push(create_listing_transaction(item));
    } /* TODO else if (is_cancelled_transaction(item)) {
            transactions.push(create_cancelled_transaction(item));
        } */ else if (is_opensea_transaction(item)) {
      create_opensea_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    } else if (is_looksrare_transaction(item)) {
      transactions.push(create_looksrare_transaction(item));
    } else if (is_x2y2_transaction(item)) {
      create_x2y2_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    } else if (is_gem_transaction(item)) {
      create_gem_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    } else if (is_genie_transaction(item)) {
      create_genie_transaction(item).forEach((tx) => {
        transactions.push(tx);
      });
    } else if (is_other(item)) {
      //console.log("Transaction is other");
    } else {
      uncaughtData.push(item);
    }
  });

  // uncaughtData.forEach((element) => {
  //   console.log(JSON.stringify(element));
  // });
  // console.log(`uncaught data length: ${uncaughtData.length}`);

  // transactions.forEach((element) => { 
  //   console.log(JSON.stringify(element));
  // });
  global.is_parsing_covalent = false;
  const endTime = performance.now();
  console.log(`Parse Covalent took ${endTime - startTime} milliseconds`);
  return transactions;
}
