import { MarketplaceDetails } from "../interfaces";

// Exchanges
export const exchange = {
  LOOKSRARE: "looksrare",
  OPENSEA: "opensea",
  GEM: "gem",
  GENIE: "genie",
  X2Y2: "x2y2",
  MINT: "mint",
  NOT_FOUND: "no exchange found",
};

// Transaction Types
export const tx_type = {
  NONE: "none",
  ERROR: "Error",
  FAILURE: "Failure",
  CANCELLED: "Cancelled",
  MINT: "Mint",
  LISTING: "Listing",
  OPENSEA_EXPENSE: "Opensea Expense",
  OPENSEA_BUYNOW_PURCHASE: "Opensea Purchase",
  OPENSEA_BUYNOW_SALE: "Opensea Sale",
  OPENSEA_BID_PURCHASE: "Opensea Bid Purchase",
  OPENSEA_BID_SALE: "Opensea Bid Sale",
  OPENSEA_BUNDLE_PURCHASE: "Opensea Bundle Purchase",
  OPENSEA_BUNDLE_SALE: "Opensea Bundle Sale",
  OPENSEA_BID_BUNDLE_PURCHASE: "Opensea Bid Bundle Purchase",
  OPENSEA_BID_BUNDLE_SALE: "Opensea Bid Bundle Sale",
  OPENSEA_MULTI_PURCHASE: "Opensea Multi Purchase",
  OPENSEA_MULTI_SALE: "Opensea Multi Sale",
  LOOKSRARE_BUYNOW_WETH_PURCHASE: "Looksrare WETH Purchase",
  LOOKSRARE_BUYNOW_WETH_SALE: "Looksrare WETH Sale",
  LOOKSRARE_BUYNOW_ETH_PURCHASE: "Looksrare ETH Purchase",
  LOOKSRARE_BUYNOW_ETH_SALE: "Looksrare ETH Sale",
  LOOKSRARE_BID_PURCHASE: "Looksrare Bid Purchase",
  LOOKSRARE_BID_SALE: "Looksrare Bid Sale",
  GEM_PURCHASE: "Gem Purchase",
  GEM_SALE: "Gem Sale",
  GENIE_PURCHASE: "Genie Purchase",
  GENIE_SALE: "Genie Sale",
  X2Y2_BUYNOW_PURCHASE: "X2Y2 Purchase",
  X2Y2_BUYNOW_SALE: "X2Y2 Sale",
};

export const purchase_type = [
  tx_type.MINT,
  tx_type.OPENSEA_BUYNOW_PURCHASE,
  tx_type.OPENSEA_BID_PURCHASE,
  tx_type.OPENSEA_BUNDLE_PURCHASE,
  tx_type.OPENSEA_BID_BUNDLE_PURCHASE,
  tx_type.OPENSEA_MULTI_PURCHASE,
  tx_type.LOOKSRARE_BUYNOW_WETH_PURCHASE,
  tx_type.LOOKSRARE_BUYNOW_ETH_PURCHASE,
  tx_type.LOOKSRARE_BID_PURCHASE,
  tx_type.GEM_PURCHASE,
  tx_type.GENIE_PURCHASE,
  tx_type.X2Y2_BUYNOW_PURCHASE,
];

export const sale_type = [
  tx_type.OPENSEA_BID_BUNDLE_SALE,
  tx_type.OPENSEA_BUNDLE_SALE,
  tx_type.OPENSEA_BID_SALE,
  tx_type.OPENSEA_BUYNOW_SALE,
  tx_type.OPENSEA_MULTI_SALE,
  tx_type.LOOKSRARE_BUYNOW_WETH_SALE,
  tx_type.LOOKSRARE_BUYNOW_ETH_SALE,
  tx_type.LOOKSRARE_BID_SALE,
  tx_type.GEM_SALE,
  tx_type.GENIE_SALE,
  tx_type.X2Y2_BUYNOW_SALE,
];

export const type_wth_gas_cost = [
  tx_type.MINT,
  tx_type.OPENSEA_BUYNOW_PURCHASE,
  tx_type.OPENSEA_BUNDLE_PURCHASE,
  tx_type.OPENSEA_MULTI_PURCHASE,
  tx_type.LOOKSRARE_BUYNOW_WETH_PURCHASE,
  tx_type.LOOKSRARE_BUYNOW_ETH_PURCHASE,
  tx_type.GEM_PURCHASE,
  tx_type.GENIE_PURCHASE,
  tx_type.X2Y2_BUYNOW_PURCHASE,
  tx_type.OPENSEA_BID_BUNDLE_SALE,
  tx_type.OPENSEA_BID_SALE,
  tx_type.LOOKSRARE_BID_SALE,
];

// Marketplace Details
export const marketplaceDetails: MarketplaceDetails[] = [
  {
    marketplace: exchange.MINT,
    exchangeContracts: {
      Mint_01: "0x0000000000000000000000000000000000000000",
    },
    sellerFee: 0,
  },
  {
    marketplace: exchange.OPENSEA,
    exchangeContracts: {
      Opensea_01: "0x7f268357a8c2552623316e2562d90e642bb538e5",
      Opensea_02: "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b",
      Opensea_03: "0xa5409ec958c83c3f309868babaca7c86dcb077c1",
      Opensea_04: "0x495f947276749ce646f68ac8c248420045cb7b5e",
      Seaport: "0x00000000006c3852cbef3e08e8df289169ede581",
    },
    sellerFee: 0.025,
  },
  {
    marketplace: exchange.X2Y2,
    exchangeContracts: {
      X2Y2_01: "0x74312363e45dcaba76c59ec49a7aa8a65a67eed3",
      X2Y2_02: "0x56dd5bbede9bfdb10a2845c4d70d4a2950163044",
    },
    sellerFee: 0.02,
  },
  {
    marketplace: exchange.LOOKSRARE,
    exchangeContracts: {
      Looksrare_01: "0x59728544b08ab483533076417fbbb2fd0b17ce3a",
      Looksrare_02: "0x31837aaf36961274a04b915697fdfca1af31a0c7",
    },
    sellerFee: 0.02,
  },
  {
    marketplace: "Rarible",
    exchangeContracts: {
      Rarible_01: "0xcd4EC7b66fbc029C116BA9Ffb3e59351c20B5B06",
    },
    sellerFee: 0.025,
  },
  {
    marketplace: exchange.GEM,
    exchangeContracts: {
      Gem_01: "0x8fc809b9acf8afdad660e5db283d7a6295355fe6",
      Gem_02: "0x866d7aa0736ddf780cbaae314832c3f77f67a773",
      Gem_03: "0xf653580a71a96f0f8896f73c7008b47603f568c9",
      Gem_04: "0xf24629fbb477e10f2cf331c2b7452d8596b5c7a5",
      Gem_05: "0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2",
      Gem_06: "0x0000000031f7382a812c64b604da4fc520afef4b",
      Gem_07: "0x0000000035634b55f3d99b071b5a354f48e10bef",
      Gem_08: "0x00000000a50bb64b4bbeceb18715748dface08af",
      Gem_09: "0x073ab1c0cad3677cde9bdb0cdeedc2085c029579",
    },
  },
  {
    marketplace: exchange.GENIE,
    exchangeContracts: {
      Genie_01: "0x2af4b707e1dce8fc345f38cfeeaa2421e54976d5",
      Genie_02: "0x0a267cf51ef038fc00e71801f5a524aec06e4f07",
    },
  },
];

// MISC
export const MINT_ADDRESS = "0x0000000000000000000000000000000000000000";
export const invalidStatus = {
  // Variable that is returned when transaction isn't ERC721
  status: false,
  type: "",
  protocol: "",
};
export const missingCollectionAddress = "Missing collection address";
export const missingCollectionName = "Missing collection name";
