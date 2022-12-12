/* eslint-disable no-var */
declare global {
  var is_fetching_asset_transfers: boolean;
  var is_fetching_nft_sales: boolean;
  var is_fetching_nft_purchases: boolean;
  var is_fetching_etherscan_transactions: boolean;
  var alchemy_call_amount: number;
  var walletAddress: string;
  var request_queue: Array;
  var request_block: number;
  var request_date: Date;
  var request_aborted: boolean;
}
  
export {};