import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_genie_sale(item: CovalentItem): Transaction[] {
  // if sale
  // check if the exchange is looksrare or not
  // if looksrare number of sales = transfer x 4
  // else number of sales = transfer x 2
  const transactions: Transaction[] = [];
  const buyer = item.from_address.toLowerCase();
  const total_value = parseFloat(item.value);
  let sender_name = "aaaaa";
  let sender_address: string | undefined = "aaaaa";
  let count = 0;
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
          const seller = event?.decoded?.params[3]?.value.toString().toLowerCase();
          if (seller == global.walletAddress) {
            const price = event.decoded?.params.find((i) => i.name == "price")?.value;
            transactions.push(
              create_transaction(
                tx_type.GENIE_SALE,
                item.tx_hash,
                item.block_signed_at,
                0,
                price != undefined && price != null ? parseFloat(price) : total_value / count,
                sender_name,
                sender_address,
                undefined,
                exchange.LOOKSRARE
              )
            );
          }
        }

        break;

      case exchange.OPENSEA:
        if (event.sender_address == marketplaceDetails.find((m) => m.marketplace == exchange.OPENSEA)?.exchangeContracts.Seaport) {
          // seaport
          const seller = item.log_events[i-1]?.decoded?.params[0]?.value.toString().toLowerCase();
          if(seller == global.walletAddress){
            transactions.push(
              create_transaction(
                tx_type.GENIE_SALE,
                item.tx_hash,
                item.block_signed_at,
                0,
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
            const seller = event?.decoded?.params[2]?.value.toString().toLowerCase();
            if (seller == global.walletAddress) {
              // sale
              const price = event.decoded.params.find((p) => p.name == "price")?.value;
              transactions.push(
                create_transaction(
                  tx_type.GENIE_SALE,
                  item.tx_hash,
                  item.block_signed_at,
                  0,
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

      case exchange.X2Y2.toLowerCase():
        if (i % 2 == 0) {
          // for seller find the next event with decoded name transfer
          for (let j = i + 1; j < (i + 3 > item.log_events.length ? item.log_events.length: i + 3); j++) {
            if (item.log_events[j]?.decoded?.name == log_types.TRANSFER) {
              const seller = item.log_events[j]?.decoded?.params
                .find((p) => p.name == "from")
                ?.value.toString()
                .toLowerCase();
              if (seller == global.walletAddress) {
                transactions.push(
                  create_transaction(
                    tx_type.GENIE_SALE,
                    item.tx_hash,
                    item.block_signed_at,
                    0,
                    total_value / count,
                    sender_name,
                    sender_address,
                    undefined,
                    exchange.X2Y2
                  )
                );
                break;
              }
            }
          }
        }
        break;
    }
  });
  return transactions;
}
