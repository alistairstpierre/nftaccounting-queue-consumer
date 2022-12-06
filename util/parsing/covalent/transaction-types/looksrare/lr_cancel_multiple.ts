import { CovalentItem, Transaction } from "../../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../../helpers";

export function create_looksrare_cancel_multiple_transaction(item: CovalentItem): Transaction {
  return create_transaction(
    tx_type.CANCELLED,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == "string" ? parseInt(item.fees_paid) : item.fees_paid,
  );
}
