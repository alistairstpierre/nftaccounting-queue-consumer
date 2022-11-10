import axios from "axios";

const fetch_1_moralis = async (next: string | undefined) => {
  let cursor = "";
  if (next != undefined) cursor = next;
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${global.walletAddress}/nft/transfers`,
    params: { chain: "eth", format: "decimal", direction: "both", cursor: next },
    headers: { accept: "application/json", "X-API-Key": `${process.env.MORALIS_API_KEY}` },
  };

  const promise = await axios
    .request(options)
    .then((res) => res.data)
    .catch(function (error) {
      console.error(error);
    });

  return promise;
};

export const get_moralis_data = async () => {
  global.is_fetching_moralis = true;
  let next: string | undefined = undefined;
  const promise: any = [];
  while (global.is_fetching_moralis) {
    let data = await fetch_1_moralis(next)
      .then((res) => {
        if (res.cursor != null) next = res.cursor;
        else global.is_fetching_moralis = false;
        return res;
      })
      .then((data) => promise.push(data));
  }
  return Promise.all(promise);
};
