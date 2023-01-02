
import { get_alchemy_imageurls_and_collectionnames } from "./util/fetching/alchemy/alchemy_images_and_collection_names";
import { get_alchemy_asset_transfers } from "./util/fetching/alchemy/alchemy_getAssetTransfers";
import Broker from "./services/rabbitMQ";
import { PrismaClient, DataStatus } from "@prisma/client";
import { prependListener } from 'process';
import { get_alchemy_nft_sales } from './util/fetching/alchemy/alchemy_getNFTSales';
import { get_alchemy_nft_purchases } from './util/fetching/alchemy/alchemy_getNFTPurchases';
import { get_etherscan_normal_transactions } from './util/fetching/etherscan/etherscan_getNormalTransactions';
import { get_etherscan_internal_transactions } from "./util/fetching/etherscan/etherscan_getInternalTransactions";
import { parse_transactions } from "./util/parsing/parse_transactions";
import { get_etherscan_erc1155_transactions } from './util/fetching/etherscan/etherscan_getERC1155Transactions';
import { get_etherscan_erc721_transactions } from './util/fetching/etherscan/etherscan_getERC721Transactions';
import { get_etherscan_erc20_transactions } from "./util/fetching/etherscan/etherscan_getERC20Transactions";
import { trades_parse } from "./util/parsing/trades";
import { Trade, Transaction } from './interfaces';
import { get_nftport } from "./util/fetching/nftport/nftport_getTransactions";
import { get_mnemonic_sender_data } from './util/fetching/mnemonic/mnemonic_getSenderNFTTransfers';
import { get_mnemonic_recipient_data } from './util/fetching/mnemonic/mnemonic_getRecipientNFTTransfer';

const { promisify } = require("util");
const RMQConsumer = new Broker().init();
const pipeline = promisify(require("stream").pipeline);
const prisma = new PrismaClient();

const resetGlobals = () => {
  global.is_fetching_asset_transfers = false;
  global.is_fetching_nft_sales = false;
  global.is_fetching_nft_purchases = false;
  global.is_fetching_etherscan_transactions = false;
  global.request_aborted = false;
  global.request_date = new Date();
  global.request_block = 0;
  global.alchemy_call_amount = 0;
}

/**
 * Process 1:1 message and stores in db, also processes group messages 1 by 1
 * @param {String} payload - message in json string format
 * @param {Function} ack - callback function
 */

const handleRequest = async (payload: any, ack: any) => {
  try {
    console.log("start data processing");
    const totalTimeStart = performance.now();
    resetGlobals();
    const payloadData = JSON.parse(payload.content.toString());
    global.walletAddress = payloadData.wallet.toLowerCase();
    await checkForDBUser();
    pendingStatus();
    const startDateAndBlock = await findStartDate();
    global.request_date = startDateAndBlock.date;
    global.request_block = startDateAndBlock.block;
    console.log(global.walletAddress, global.request_date, global.request_block);
    const fetched_data = await Promise.all([
      get_etherscan_normal_transactions(),
      get_etherscan_internal_transactions(),
      get_etherscan_erc721_transactions(),
      get_etherscan_erc1155_transactions(),
      get_alchemy_asset_transfers(),
      get_alchemy_nft_sales(),
      get_alchemy_nft_purchases(),
      get_mnemonic_sender_data(),
      get_mnemonic_recipient_data()
    ]);

    if (global.request_aborted) {
      console.log("request aborted");
      failureStatus();
      ack();
      await disconnectPrisma();
      return;
    }

    const parsed_transactions = await parse_transactions(fetched_data);
    const data = trades_parse(parsed_transactions.purchases, parsed_transactions.sales);

    const tradesWithUrlsAndCollectionNames = await get_alchemy_imageurls_and_collectionnames(data.trades);
    if (global.request_aborted) {
      console.log("request aborted");
      failureStatus();
      ack();
      await disconnectPrisma();
      return;
    }

    if (tradesWithUrlsAndCollectionNames == undefined) return;
    const filteredTrades = tradesWithUrlsAndCollectionNames.filter((trade: Trade) => {
      if (trade.projectName == undefined || trade.projectName.length >= 255) trade.projectName = trade.projectAddress;
      if (trade.imgUrl == undefined || trade.imgUrl.length > 510) trade.imgUrl = "/Rhombus.gif";
      return trade.purchaseUUID != undefined && trade.purchaseUUID.length < 255;
    });

    const mappedTrades = await filteredTrades.map((trade: Trade, index: Number) => {
      return {
        purchaseUUID: trade.purchaseUUID,
        saleUUID: trade.saleUUID,
        purchaseDate: trade.purchaseDate,
        saleDate: trade.saleDate,
        purchaseBlock: trade.purchaseBlock,
        saleBlock: trade.saleBlock,
        purchaseType: trade.purchaseType,
        purchaseTransaction: trade.purchaseTransaction,
        saleType: trade.saleType,
        SaleTransaction: trade.SaleTransaction,
        imgUrl: trade.imgUrl,
        tokenId: trade.tokenId,
        contract: trade.contract,
        projectAddress: trade.projectAddress,
        projectName: trade.projectName,
        cost: trade.cost,
        sale: trade.sale,
        feeGas: trade.feeGas,
        feeExchange: trade.feeExchange,
        feeRoyalty: trade.feeRoyalty,
        walletAddress: global.walletAddress,
      };
    });

    const mapped_expenses = await parsed_transactions.other.map((expense: Transaction) => {
      return {
        cost: expense.gas,
        date: expense.date,
        blockNumber: Number(expense.block),
        type: expense.type,
        walletAddress: global.walletAddress,
      }
    });

    let startTime = performance.now();

    if (mappedTrades.length > 0 || mapped_expenses.length > 0) {
      const {expenses, trades} = await updateDB({ mappedTrades, mapped_expenses })

      if(expenses.success == 0 || trades.success == 0) {
        deleteWalletData(global.walletAddress);
        console.log("error updating db");
        failureStatus();
        ack();
        await disconnectPrisma();
        return;
      }
      let endTime = performance.now();
      console.log(`updating db took ${endTime - startTime} milliseconds`);
    } else {
      console.log("no new data");
    }

    await prisma.user.update({
      where: { walletAddress: global.walletAddress },
      data: {
        dataStatus: DataStatus.SUCCESS,
      },
    });
    const totalTimeEnd = performance.now();
    console.log(`total request time took ${totalTimeEnd - totalTimeStart} milliseconds`);
    ack();
    await disconnectPrisma();
    console.log("data processing complete");
  } catch (error) {
    console.error(error);
  }
};

async function deleteWalletData(walletAddress: string) {
  await prisma.eRC721Trade.deleteMany({
    where: {
      walletAddress: walletAddress,
    },
  });
  await prisma.expense.deleteMany({
    where: {
      walletAddress: walletAddress,
    },
  });
}

async function deleteAllData() {
  await prisma.eRC721Trade.deleteMany();
  await prisma.expense.deleteMany();
}

async function checkForDBUser() {
  await prisma.user.findFirst({
    where: { walletAddress: global.walletAddress },
  }).then((user: any) => {
    if (user == null) {
      return prisma.user.create({
        data: {
          walletAddress: global.walletAddress,
        },
      });
    }
  });
}

async function disconnectPrisma() {
  await prisma.$disconnect()
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
    });
}

async function pendingStatus() {
  try {
    await prisma.user.update({
      where: { walletAddress: global.walletAddress },
      data: {
        dataStatus: DataStatus.PENDING,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

async function failureStatus() {
  try {
    await prisma.user.update({
      where: { walletAddress: global.walletAddress },
      data: {
        dataStatus: DataStatus.FAILURE,
      },
    });
  } catch (error) {
    console.error(error);
  }

}

async function findStartDate() {
  let lastTrade = new Date(0);
  let lastBlock = 0;
  try {
    const user = await prisma.user.findFirst({
      where: { walletAddress: global.walletAddress },
    });
    if (user == null) {
      return { date: lastTrade, block: lastBlock };
    }
    const purchaseDates = await prisma.eRC721Trade.findFirst({
      where: { walletAddress: global.walletAddress },
      orderBy: { purchaseDate: "desc" },
    });
    const saleDates = await prisma.eRC721Trade.findFirst({
      where: { walletAddress: global.walletAddress },
      orderBy: { saleDate: "desc" },
    })
    const expenses = await prisma.expense.findFirst({
      where: { walletAddress: global.walletAddress },
      orderBy: { date: "desc" },
    });
    if (purchaseDates != null) {
      lastBlock = lastTrade > purchaseDates.purchaseDate ? lastBlock : purchaseDates.purchaseBlock;
      lastTrade = lastTrade > purchaseDates.purchaseDate ? lastTrade : purchaseDates.purchaseDate;
    }
    if (saleDates != null && saleDates.saleDate != null && saleDates.saleBlock != null) {
      lastBlock = lastTrade > saleDates.purchaseDate ? lastBlock : saleDates.saleBlock;
      lastTrade = lastTrade > saleDates.saleDate ? lastTrade : saleDates.saleDate;
    }
    if (expenses != null) {
      lastBlock = lastTrade > expenses.date ? lastBlock : expenses.blockNumber;
      lastTrade = lastTrade > expenses.date ? lastTrade : expenses.date;
    }
  } catch (error) {
    console.error(error);
  }
  return { date: lastTrade, block: lastBlock };
}

async function updateDB({ mappedTrades, mapped_expenses }: any) {
  const expenses = await prisma.expense.createMany({
    data: mapped_expenses,
  })
  .then((t) => {return {success: t.count}})
  .catch((e) => { 
    console.log(e) 
    return {success: 0}
  });
  const trades = await prisma.eRC721Trade.createMany({
    data: mappedTrades,
  })
  .then((t) => {return {success: t.count}})
  .catch((e) => {
    console.log(e)
    return {success: 0}
  });
  return {expenses, trades};
}

async function processUploads() {
  const EXCHANGE = "send";
  try {
    const consumer = await RMQConsumer;
    await consumer.createEx({
      name: EXCHANGE,
      type: "direct",
    });
    consumer.subscribe({ exchange: "send", bindingKey: "wallet-history" }, handleRequest);
  } catch (error) {
    console.log(error);
  }
}

processUploads();
console.log("consumer started");

// close channek, connection on exit
process.on("exit", (code) => async () => {
  (await RMQConsumer).channel.close();
  (await RMQConsumer).connection.close();
});