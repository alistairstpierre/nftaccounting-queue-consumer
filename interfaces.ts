import { AssetTransfersCategory } from "alchemy-sdk";

// Transaction
export interface Transaction {
  type: string;
  tx_hash: string;
  date: Date;
  block: string;
  gas?: number;
  value?: number;
  marketplace?: string;
  royalty?: number;
  collection_contract?: string;
  collection_name?: string;
  token_id?: string;
  market_fee?: number;
  category?: AssetTransfersCategory;
  uuid?: string;
}

export interface EtherscanResult {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export interface GroupedCollection {
  amount: number;
  data: Trade;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface Trade {
  purchaseUUID: string;
  saleUUID?: string;
  purchaseTransaction: string;
  purchaseType: string;
  saleType?: string;
  SaleTransaction?: string;
  imgUrl?: string;
  tokenId?: string;
  projectAddress?: string;
  projectName?: string;
  date: Date;
  cost?: number;
  sale?: number;
  feeGas?: number;
  feeExchange?: number;
  feeRoyalty?: number;
  notes?: string;
  contract?: AssetTransfersCategory;
}

export interface TradeDisplay {
  id: number;
  img_url: string;
  project: string;
  date: string;
  cost: number;
  sale: number;
  fees: number;
  profit: number;
  notes: string;
}

export interface Note {
  id?: string;
  userId: string;
  noteId: string;
  entry: string;
}

// Moralis
export interface MoralisItem {
  block_number: string;
  block_timestamp: Date;
  block_hash: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  value: string;
  contract_type: AssetTransfersCategory;
  transaction_type: TransactionType;
  token_address: string;
  token_id: string;
  from_address: string;
  to_address: string;
  amount: number;
  verified: number;
}

export enum Chain {
  The0X1 = "0x1",
}

export enum TransactionType {
  Single = "Single",
}

// Covalent
export interface Param {
  name: string;
  value: any;
}

export interface Decoded {
  name: string;
  params: Param[];
}

export interface LogEvent {
  sender_name: any;
  sender_address: string;
  tx_offset: number;
  decoded: Decoded | null;
}

export interface CovalentItem {
  block_signed_at: string;
  tx_hash: string;
  successful: boolean;
  from_address: string;
  to_address: string;
  to_address_label: string | null;
  value: string;
  fees_paid: string | number;
  log_events: LogEvent[];
}

export interface Pagination {
  has_more: boolean;
  page_number: number;
  page_size: number;
  total_count?: any;
}

export interface Data {
  address: string;
  updated_at: string;
  next_update_at: string;
  quote_currency: string;
  chain_id: number;
  CovalentItems: CovalentItem[];
  pagination: Pagination;
}

export interface MarketplaceDetails {
  marketplace: string;
  exchangeContracts: any;
  sellerFee?: number;
}
