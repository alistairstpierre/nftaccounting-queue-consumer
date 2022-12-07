import { MoralisItem, Trade, Transaction, Data } from './interfaces';
import { get_covalent_data } from "./util/fetching/covalent";
import { get_moralis_data } from "./util/fetching/moralis";
import { moralis_parse } from "./util/parsing/moralis/moralisparser";
import { trades_parse } from "./util/parsing/trades";
import { get_image_urls } from "./util/fetching/alchemy";
import Broker from "./services/rabbitMQ";
import { PrismaClient, DataStatus } from "@prisma/client";

const { promisify } = require("util");
const RMQConsumer = new Broker().init();
const pipeline = promisify(require("stream").pipeline);
const prisma = new PrismaClient();

const resetGlobals = () => {
  global.is_fetching_covalent = false;
  global.is_fetching_moralis = false;
  global.is_fetching_opensea = false;
  global.is_parsing_covalent = false;
  global.request_aborted = false;
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
    resetGlobals();
    const payloadData = JSON.parse(payload.content.toString());
    global.walletAddress = payloadData.wallet.toLowerCase();
    await checkForDBUser();
    pendingStatus();
    global.request_date = await findStartDate();
    console.log(global.walletAddress, global.request_date);
    let startTime = performance.now();
    const added: any = await Promise.all([get_covalent_data(), get_moralis_data()]);
    let endTime = performance.now();
    console.log("fetching and parsing covalent and morlais data took " + (endTime - startTime) + " milliseconds.");
    if(global.request_aborted){
      console.log("request aborted");
      failureStatus();
      ack();
      await disconnectPrisma();
      return;
    }
    const covalent: Transaction[] = [];
    const moralis: MoralisItem[] = [];
    added[0].forEach((item: any) => {
      item.forEach((element: any) => {
        element.forEach((obj: any) => {
          covalent.push(obj);
        });
      });
    });
    added[1].forEach((item: any) => {
      item.forEach((element: any) => {
        moralis.push(element);
      });
    });
    const preParse = moralis_parse(moralis, covalent);

    const data = trades_parse(preParse);
    
    const tradesWithUrls = await get_image_urls(data.trades);
    if(global.request_aborted){
      console.log("request aborted");
      failureStatus();
      ack();
      await disconnectPrisma();
      return;
    }
    const mappedTrades = tradesWithUrls.map((trade: Trade) => {
      return {
        purchaseUUID: trade.purchaseUUID,
        saleUUID: trade.saleUUID,
        date: trade.date,
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
        profit: trade.profit,
        walletAddress: global.walletAddress,
      };
    });

    const expenses = data.cancels.concat(data.listings, data.failures, data.opensea_expenses);
    const mapped_expenses = expenses.map((expense: Transaction) => {
      return {
        cost: expense.gas,
        date: expense.date,
        type: expense.type,
        walletAddress: global.walletAddress,
      }
    });
    startTime = performance.now();
    if(mappedTrades.length > 0 || mapped_expenses.length > 0) {
      await updateDB({mappedTrades, mapped_expenses})
      endTime = performance.now();
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
    ack();
    await disconnectPrisma();
    console.log("data processing complete");
  } catch (error) {
    console.error(error);
  }
};

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
  try {
    const user = await prisma.user.findFirst({
      where: { walletAddress: global.walletAddress },
    });
    if (user == null) {
      return lastTrade;
    }
    const trades = await prisma.eRC721Trade.findFirst({
      where: { walletAddress: global.walletAddress },
      orderBy: { date: "desc" },
    });
    const expenses = await prisma.expense.findFirst({
      where: { walletAddress: global.walletAddress },
      orderBy: { date: "desc" },
    });
    if (trades != null && expenses == null) lastTrade = trades.date;
    else if (trades == null && expenses != null) lastTrade = expenses.date;
    else if (trades != null && expenses != null) {
      lastTrade = trades.date > expenses.date ? trades.date : expenses.date;
    }
  } catch (error) {
    console.error(error);
  }
  return lastTrade;
}

async function updateDB({mappedTrades, mapped_expenses}:any) {
  try {
    await prisma.expense.createMany({
      data: mapped_expenses,
    })
    await prisma.eRC721Trade.createMany({
      data: mappedTrades,
    });
  } catch (error) {
    console.error(error);
  }
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