import { CovalentItem, Transaction } from "../../../../interfaces"
import { exchange, marketplaceDetails, tx_type } from "../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../helpers";

export function is_other(item: CovalentItem): boolean {
  // Check if transfer happens at all
  if (
    item.log_events.filter((e) => e.decoded?.name == log_types.TRANSFER)
      .length == 0
  )
    return true;

  // ETH transfer
  if (
    get_marketplace(item.to_address) == undefined &&
    item.successful &&
    item.log_events.length == 0 &&
    parseInt(item.value) > 0
  )
    return true;
  // Token swap
  if (
    item.to_address_label != null &&
    (item.to_address_label.toLowerCase().includes("uniswap") ||
      item.to_address_label.toLowerCase().includes("wrapped ether"))
  )
    return true;
  // Staking platforms && airdrops
  if (
    item.to_address.toLowerCase() ==
      "0xf026fb5be56ff63e19e9da3236035e80e5780663".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0x0ff6ffcfda92c53f615a4a75d982f399c989366b".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0x5fdcca53617f4d2b9134b29090c87d01058e27e9".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0xf57e7e7c23978c3caec3c3548e3d615c346e79ff".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0xccc8cb5229b0ac8069c51fd58367fd1e622afd97".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0xcec8f07014d889442d7cf3b477b8f72f8179ea09".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0x7b837cECbF1c8487d0ae1535837B9f17aF5e59A7".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0x1883a07c429e84aca23b041c357e1d21a2b645f3".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0xfbb3c73779ef59f0c4a2e662f9a42a82a145e638".toLowerCase() ||
    item.to_address.toLowerCase() ==
      "0xd152f549545093347a162dce210e7293f1452150".toLowerCase()
  )
    return true;
  // Token transfers && Wraps
  for (const event of item.log_events) {
    if (
      event.decoded?.name == log_types.PAIRCREATED ||
      event.decoded?.name == log_types.DEPOSIT ||
      event.decoded?.name == log_types.MULTISENDED ||
      event.decoded?.name == "TransferSingle" ||
      event.decoded?.name.toLowerCase().includes("stake") ||
      event.decoded?.name == "LogTokenBulkSent"
    )
      return true;
  }
  // NFT transfers
  if (parseInt(item.value) == 0) {
    for (const event of item.log_events) {
      if (
        !(
          event.decoded?.name == log_types.TRANSFER ||
          event.decoded?.name == log_types.APPROVAL
        )
      )
        return false;
      for (const param of event.decoded.params) {
        if (
          !(
            param.name == "from" ||
            param.name == "to" ||
            param.name == "tokenId"
          )
        )
          return false;
      }
    }
    return true;
  }

  //
  return false;
}

export function create_failed_transaction(item: CovalentItem): Transaction {
  return create_transaction(
    tx_type.FAILURE,
    item.tx_hash,
    item.block_signed_at,
    typeof item.fees_paid == 'string' ? parseInt(item.fees_paid) : item.fees_paid,
  );
}
