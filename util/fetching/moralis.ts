import axios from "axios";
import { CANCELLED } from "dns";
import { MoralisItem } from "../../interfaces";

const fetch_1_moralis = async (next: string | undefined) => {
  let cursor = "";
  if (next != undefined) cursor = next;
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${global.walletAddress}/nft/transfers`,
    params: { chain: "eth", format: "decimal", direction: "both", cursor: next },
    headers: { accept: "application/json", "X-API-Key": `${process.env.MORALIS_API_KEY}` },
  };

  const startTime = performance.now();
  const promise = await axios
    .request(options)
    .then((res) => res.data)
    .then((data) => {
      const endTime = performance.now();
      console.log(`Fetching Moralis took ${endTime - startTime} milliseconds`);
      return data;
    })
    .catch(function (error) {
      console.error(error);
    });

  return promise;
};

const checkForDate = (data: MoralisItem[]) => {
  const dateFiltered:MoralisItem[] = [];
  let contains = false;
  for(const nft of data){
    if(new Date(nft.block_timestamp) <= global.request_date){
      contains = true;
    } else {
      dateFiltered.push(nft);
    }
  }
  return {contains: contains, data: dateFiltered};
}

export const get_moralis_data = async () => {
  global.is_fetching_moralis = true;
  let next: string | undefined = undefined;
  const promise: any = [];
  while (global.is_fetching_moralis) {
    let data = await fetch_1_moralis(next)
      .then((res) => {
        if (res.cursor != null){
          next = res.cursor;
          if(global.request_date != null){
            const dateCheck = checkForDate(res.result);
            if(dateCheck.contains){
              global.is_fetching_moralis = false;
              return dateCheck.data;
            }
          }
        } 
        else global.is_fetching_moralis = false;
        return res.result;
      })
      .then((data) => promise.push(data));
  }
  const endTime = performance.now();
  return Promise.all(promise);
};
