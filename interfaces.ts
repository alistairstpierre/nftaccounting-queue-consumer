// Transaction
export interface Transaction {
  type: string;
  tx_hash: string;
  date: string;
  gas?: number;
  price?: number;
  collection_name?: string;
  collection_address?: string;
  exchange?: string;
  token_ID?: string;
  market_fee?: number;
  royalty_fee?: number;
  contract?: "ERC721" | "ERC1155";
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
  id: number;
  purchase_tx: string;
  purchase_type: string;
  sale_type?: string;
  sale_tx?: string;
  img_url?: string;
  token_id?: string;
  project_address?: string;
  project?: string;
  date: string;
  cost?: number;
  sale?: number;
  fee_gas?: number;
  fee_exchange?: number;
  fee_royalty?: number;
  profit: number;
  notes?: string;
  contract?: "ERC721" | "ERC1155";
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
  contract_type: ContractType;
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

export enum ContractType {
  Erc721 = "ERC721",
  Erc1155 = "ERC1155",
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
