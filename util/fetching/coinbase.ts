import axios from "axios";

const coinbase_url = new URL(`https://api.coinbase.com/v2/prices/ETH-USD/sell`);

export const useCoinbasePrice = () => {
  axios.get(coinbase_url.toString()).then((res) => res.data).then((data) => {
    console.log("coinbase", data);
  });
};
