import { CovalentItem, Transaction } from "../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../helpers";

export function is_failed_transaction(item: CovalentItem): boolean {
    if (get_marketplace(item.to_address) != undefined)
        return false
    if (item.successful == true)
        return false
    return true
}

export function create_failed_transaction(item: CovalentItem): Transaction {
    return create_transaction(
        tx_type.FAILURE, 
        item.tx_hash, 
        item.block_signed_at,
        typeof item.fees_paid == 'string' ? parseInt(item.fees_paid) : item.fees_paid,
    );
}