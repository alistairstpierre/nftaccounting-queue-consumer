import { MoralisItem, Transaction } from "./interfaces";
import { get_covalent_data } from "./util/fetching/covalent";
import { get_moralis_data } from "./util/fetching/moralis";
import { moralis_parse } from "./util/parsing/moralis/moralisparser";
import { trades_parse } from "./util/parsing/trades";
import { get_image_urls } from "./util/fetching/alchemy";
import Broker from "./services/rabbitMQ";

const { promisify } = require("util");
const RMQConsumer = new Broker().init();
const pipeline = promisify(require("stream").pipeline);

/**
 * Process 1:1 message and stores in db, also processes group messages 1 by 1
 * @param {String} payload - message in json string format
 * @param {Function} ack - callback function
 */
const handleRequest= async (payload: any, ack: any) => {
  try {
    console.log("start data processing");
    global.is_fetching_covalent = false;
    global.is_fetching_moralis = false;
    global.is_fetching_opensea = false;
    global.is_parsing_covalent = false;
    global.alchemy_call_amount = 0;
    global.walletAddress = payload.content.toString().toLowerCase();
    const startTime = performance.now();
    const added: any = await Promise.all([get_covalent_data(), get_moralis_data()]);
    const endTime = performance.now();
    console.log(`Fetching took ${endTime - startTime} milliseconds`);
    const covalent: Transaction[] = [];
    const moralis: MoralisItem[] = [];
    let covalentTradeCount = 0;
    let moralisTxCount = 0;
    added[0].forEach((item: any) => {
      item.forEach((element: any) => {
        element.forEach((obj: any) => {
          covalent.push(obj);
        });
      });
    });
    added[1].forEach((item: any) => {
      item.result.forEach((element: any) => {
        moralis.push(element);
      });
    });
    const preParse = moralis_parse(moralis, covalent);
    const trades = trades_parse(preParse).trades;
    const tradesWithUrls = await get_image_urls(trades);

    ack();
    console.log("data processing complete");
  } catch (error) {
    console.error(error);
  }
};

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
