import { CovalentItem, Transaction } from "../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../helpers";

export function is_listing_transaction(item: CovalentItem): boolean {
    if (parseInt(item.value) != 0)
        return false
    if (item.log_events.length > 1)
        return false
    if (item.log_events[0]?.decoded?.name != "ApprovalForAll")
        return false
    return true
}

export function create_listing_transaction(item: CovalentItem): Transaction {
    return create_transaction(
        tx_type.LISTING, 
        item.tx_hash, 
        item.block_signed_at,
        typeof item.fees_paid == 'string' ? parseInt(item.fees_paid) : item.fees_paid,
    );
}