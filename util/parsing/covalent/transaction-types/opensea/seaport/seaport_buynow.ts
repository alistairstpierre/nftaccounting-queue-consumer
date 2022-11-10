import { CovalentItem, LogEvent, Transaction } from "../../../../../../interfaces"
import { exchange, tx_type } from "../../../../../../util/nft-constants";
import { create_transaction } from "../../../../../helpers";

export function create_seaport_buynow_transaction(item: CovalentItem): Transaction {
  const data = get_seaport_data(item.log_events[0] as any);

  return create_transaction(
    data.type,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == "string" ? parseInt(item.fees_paid) : item.fees_paid,
    parseInt(item.value),
    data.sender_name,
    data.sender_address,
    undefined,
    exchange.OPENSEA
  );
}

export function get_seaport_data(event: LogEvent) {
  const purchaser = event.decoded?.params.find((param) => param.name == "to" || param.name =="_to")?.value.toString().toLowerCase();
  const seller = event.decoded?.params.find((param) => param.name == "from" || param.name == "_from")?.value.toString().toLowerCase();
  let type = purchaser == global.walletAddress ? tx_type.OPENSEA_BUYNOW_PURCHASE : tx_type.OPENSEA_BUYNOW_SALE;
  if (type == tx_type.OPENSEA_BUYNOW_SALE && seller != global.walletAddress) {
    type = tx_type.ERROR;
  }
  const sender_name = event?.sender_name;
  const sender_address = event?.sender_address;
  return { purchaser: purchaser, seller: seller, type: type, sender_name: sender_name, sender_address: sender_address };
}
