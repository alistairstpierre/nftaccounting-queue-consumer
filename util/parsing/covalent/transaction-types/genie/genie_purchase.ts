import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_genie_purchase(item: CovalentItem): Transaction[] {
  // if sale
  // check if the exchange is looksrare or not
  // if looksrare number of sales = transfer x 4
  // else number of sales = transfer x 2
  const transactions: Transaction[] = [];
  const buyer = item.from_address.toLowerCase();
  const total_value = parseFloat(item.value);
  const total_gas = typeof item.fees_paid == "string" ? parseFloat(item.fees_paid) : item.fees_paid;
  let count = 0;
  let sender_name = "_aaaa";
  let sender_address: string | undefined = "_aaaa";
  item.log_events.forEach((event, i) => {
    if (event.decoded?.name == log_types.TRANSFER) {
      // In event.decoded.params find the param where "name" = "from" then get the "value" from that param
      event.decoded.params.find((param) => {
        if (param.name == "to") {
          if (param.value.toLowerCase() == buyer) {
            (sender_name = item.log_events[i]?.sender_name), (sender_address = item.log_events[i]?.sender_address);
            count++;
          }
        }
      });
    }
  });

  item.log_events.forEach((event, i) => {
    const marketplace = get_marketplace(event.sender_address);
    switch (marketplace) {
      case exchange.LOOKSRARE:
        if (event.decoded?.name.toLowerCase() == log_types.TAKERBID.toLowerCase()) {
          const price = event.decoded?.params.find((i) => i.name == "price")?.value;
          transactions.push(
            create_transaction(
              tx_type.GENIE_PURCHASE,
              item.tx_hash,
              item.block_signed_at,
              total_gas / count,
              price != undefined && price != null ? parseFloat(price) : total_value / count,
              sender_name,
              sender_address,
              undefined,
              exchange.LOOKSRARE
            )
          );
        }
        break;

      case exchange.OPENSEA:
        if (event.sender_address == marketplaceDetails.find((m) => m.marketplace == exchange.OPENSEA)?.exchangeContracts.Seaport) {
          // console.log("SEAPORT")
          if (buyer == global.walletAddress) {
            transactions.push(
              create_transaction(
                tx_type.GENIE_PURCHASE,
                item.tx_hash,
                item.block_signed_at,
                total_gas / count,
                total_value / count,
                sender_name,
                sender_address,
                undefined,
                exchange.OPENSEA
              )
            );
          }
        } else {
          // opensea
          if (event.decoded?.name == log_types.ORDERS_MATCHED) {
            if (buyer == global.walletAddress) {
              // sale
              const price = event.decoded.params.find((p) => p.name == "price")?.value;
              transactions.push(
                create_transaction(
                  tx_type.GENIE_PURCHASE,
                  item.tx_hash,
                  item.block_signed_at,
                  total_gas / count,
                  price != undefined && price != null ? parseFloat(price) : total_value / count,
                  sender_name,
                  sender_address,
                  undefined,
                  exchange.OPENSEA
                )
              );
            } else {
              break;
            }
          }
        }
        break;

      case exchange.X2Y2:
        if (i % 2 == 0) {
          if (buyer == global.walletAddress) {
            transactions.push(
              create_transaction(
                tx_type.GENIE_PURCHASE,
                item.tx_hash,
                item.block_signed_at,
                total_gas / count,
                total_value / count,
                sender_name,
                sender_address,
                undefined,
                exchange.X2Y2
              )
            );
          }
        }
        break;
    }
  });
  return transactions;
}
