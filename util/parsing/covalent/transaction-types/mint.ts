import { CovalentItem, Transaction } from "../../../../interfaces"
import { exchange, marketplaceDetails, MINT_ADDRESS, tx_type } from "../../../../util/nft-constants";
import { create_transaction, get_marketplace, log_types } from "../../../helpers";

export function is_mint_transaction(item: CovalentItem): boolean {
  for (const log_event of item.log_events) {
    if (log_event.decoded != null && log_event.decoded.params != null) {
      let mint_address_check = false;
      let tokenId_check = false;
      for (const param of log_event.decoded.params) {
        if (param.name === "from" && param.value == MINT_ADDRESS) mint_address_check = true;
        if (Object.values(param).includes("tokenId")) tokenId_check = true;
      }
      if (mint_address_check && tokenId_check) {
        return true;
      } else {
        mint_address_check = false;
        tokenId_check = false;
      }
    }
  }
  return false;
}

export function create_mint_transaction(item: CovalentItem): Transaction[] {
  const mints = <Transaction[]>[];
  for (const log_event of item.log_events) {
    if (log_event.decoded?.params != null) {
      for (const event of log_event.decoded?.params) {
        if (event.name === "to" && event.value.toString().toLowerCase() != global.walletAddress){
          return create_transfer_mint_transaction(item);
        }
      }
      return create_normal_mint_transactions(item);
    }
  }
  return mints;
}

function create_transfer_mint_transaction(item: CovalentItem) :Transaction[] {
  const mints = <Transaction[]>[];
  let mint_amount = 0;
  let sender_name = undefined;
  let sender_address = undefined;
  let token_IDs: string[] | undefined = undefined;

  for (const log_event of item.log_events) {
    sender_name = log_event.sender_name;
    sender_address = log_event.sender_address;
    let address_check = false;
    let tokenId = undefined;
    if (log_event.decoded?.params != null) {
      for (const event of log_event.decoded?.params) {
        if (event.name === "to" && event.value.toString().toLowerCase() == global.walletAddress) address_check = true;
        if (event.name === log_types.TOKENID) {
          tokenId = event.value;
          if (address_check && tokenId != undefined) {
            if (token_IDs == undefined) token_IDs = [];
            mint_amount++;
            token_IDs.push(tokenId);
          }
        }
      }
    }
  }

  if (token_IDs != undefined) {
    if (mint_amount != token_IDs.length) token_IDs = undefined;
  }

  for (let i = 0; i < mint_amount; i++) {
    mints.push(
      create_transaction(
        tx_type.MINT,
        item.tx_hash,
        item.block_signed_at,
        0,
        0,
        sender_name,
        sender_address,
        token_IDs != undefined ? token_IDs[i] : undefined
      )
    );
  }
  return mints;
}

function create_normal_mint_transactions(item: CovalentItem): Transaction[] {
  const mints = <Transaction[]>[];
  let mint_amount = 0;
  let sender_name = undefined;
  let sender_address = undefined;
  let token_IDs: string[] | undefined = undefined;

  for (const log_event of item.log_events) {
    sender_name = log_event.sender_name;
    sender_address = log_event.sender_address;
    let address_check = false;
    let tokenId = undefined;
    if (log_event.decoded?.params != null) {
      for (const event of log_event.decoded?.params) {
        if (event.name === "to" && event.value.toString().toLowerCase() == global.walletAddress) address_check = true;
        if (event.name === log_types.TOKENID) {
          tokenId = event.value;
          if (address_check && tokenId != undefined) {
            if (token_IDs == undefined) token_IDs = [];
            mint_amount++;
            token_IDs.push(tokenId);
          }
        }
      }
    }
  }

  if (token_IDs != undefined) {
    if (mint_amount != token_IDs.length) token_IDs = undefined;
  }

  for (let i = 0; i < mint_amount; i++) {
    mints.push(
      create_transaction(
        tx_type.MINT,
        item.tx_hash,
        item.block_signed_at,
        typeof item.fees_paid == "string" ? parseInt(item.fees_paid) / mint_amount : item.fees_paid / mint_amount,
        Number.parseFloat(item.value) / mint_amount,
        sender_name,
        sender_address,
        token_IDs != undefined ? token_IDs[i] : undefined
      )
    );
  }
  return mints;
}