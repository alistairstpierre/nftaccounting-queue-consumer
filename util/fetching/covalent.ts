// import { parse } from "../parsing/covalent/covalentparser"
// import { CheckIfFetchFinished } from "./fetcher";
import axios from "axios";
import { parse } from "../parsing/covalent/covalentparser";

const params = {
  "quote-currency": "USD",
  format: "json",
  "block-signed-at-asc": "false",
  "no-logs": "false",
  "page-size": "100",
};

export const get_covalent_data = async () => {
  const data = [];
  let start = 0;
  global.is_fetching_covalent = true;
  const controller = new AbortController();
  const startTime = performance.now();
  do {
    data.push(fetch_5(start, controller).then((res) => res));
    await sleep(1);
    start += 5;
  } while (global.is_fetching_covalent);
  const endTime = performance.now();
  console.log(`Fetching Covalent took ${endTime - startTime} milliseconds`);
  return Promise.all(data);
};

const fetch_1 = async (page: number, controller: AbortController) => {
  const url = new URL(`https://api.covalenthq.com/v1/1/address/${global.walletAddress}/transactions_v2/`);
  const tempParams: any = params;
  tempParams["page-number"] = `${page}`;
  tempParams["key"] = `${process.env.COVALENT_API_KEY}`;
  url.search = new URLSearchParams(params).toString();

  const start = performance.now();

  const promise = axios
    .get(url.toString(), { signal: controller.signal })
    .then((res) => res.data)
    .then((data) => {
      const end = performance.now();
      console.log(`Fetching Covalent page ${page} took ${end - start} milliseconds`);

      if (!data.data.pagination.has_more) {
        global.is_fetching_covalent = false;
      }
      if(global.request_date != null){
        const dateFiltered = [];
        for(const item of data.data.items){
          if(new Date(item.block_signed_at) <= global.request_date){
            global.is_fetching_covalent = false;
          } else {
            dateFiltered.push(item);
          }
        };
        return parse(dateFiltered);
      }
      // make a new array from the data and return that.
      return parse(data.data.items);
    })    
    .catch((error) => {
      console.log("covalent", error.response.data.error_message)
      global.request_aborted = true;
      controller.abort();
    });

  return promise;
};

const fetch_5 = async (start: number, controller: AbortController) => {
  const data = [];
  for (let i = start; i < start + 5; i++) {
    data.push(fetch_1(i, controller));
  }
  return Promise.all(data);
};

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
