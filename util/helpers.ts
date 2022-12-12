import { marketplaceDetails } from "./nft-constants";
import { exchange as exc }  from "./nft-constants";
import { Transaction } from "../interfaces";

export function get_marketplace(address: string) {
  for (const contracts of marketplaceDetails) {
    if (Object.values(contracts.exchangeContracts).includes(address)) {
      return contracts.marketplace;
    }
  }
  return undefined;
}

export const log_types = {
  ORDERS_MATCHED: "OrdersMatched",
  ORDER_CANCELLED: "OrderCancelled",
  UPGRADED: "Upgraded",
  TRANSFER: "Transfer",
  TAKERBID: "TakerBid",
  TAKERASK: "TakerAsk",
  PAIRCREATED: "PairCreated",
  DEPOSIT: "Deposit",
  TOKENID: "tokenId",
  MULTISENDED: "Multisended",
  APPROVAL: "Approval",
  NONCE_INCREMENTED: "NonceIncremented",
  CANCEL_MULTIPLE_ORDERS: "CancelMultipleOrders",
};

const gweiInEth = 0.000000000966;
export function gweiToEth(gweiAmount: number | undefined): number {
  if (gweiAmount === undefined) return 0;
  return gweiAmount * gweiInEth;
}

const weiInEth: number = Math.pow(10, -18);
export function weiToEth(weiAmount: number | undefined): number {
  if (weiAmount === undefined) return 0;
  return weiAmount * weiInEth;
}

export function getExchangeFee(exchange: string | undefined, price: number | undefined) {
  if(exchange === undefined || price === undefined) return 0;
  switch (exchange) {
    case exc.OPENSEA:
      const os = marketplaceDetails.find(x => x.marketplace == exc.OPENSEA)
      if(os != undefined && os.sellerFee != undefined) return price * os.sellerFee;
      break;
    case exc.LOOKSRARE:
      const lr = marketplaceDetails.find(x => x.marketplace == exc.LOOKSRARE)
      if(lr != undefined && lr.sellerFee != undefined) return price * lr.sellerFee;
      break;
    case exc.X2Y2:
      const xy = marketplaceDetails.find(x => x.marketplace == exc.X2Y2)
      if(xy != undefined && xy.sellerFee != undefined) return price * xy.sellerFee;
      break;
  }
  return 0;
}

export function getRoyaltyFee(royalty_points: number, sale: number | undefined) {
  if(sale === undefined) return 0;
  return sale * (royalty_points / 10000);
}

export function formatDateLong(date: string): string {
  return new Date(Date.parse(date)).toLocaleString();
}

export function formatDateShort(date: string): string {
  let tempDate = new Date(Date.parse(date)).toLocaleDateString();
  if (tempDate === "Invalid Date") {
    tempDate = "Unknown";
  }
  return tempDate;
}
