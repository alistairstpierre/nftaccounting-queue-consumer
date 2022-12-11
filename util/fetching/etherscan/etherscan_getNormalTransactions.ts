import axios from "axios";
import { EtherscanResult } from "../../../interfaces";
import { parse_etherscan_transactions } from "../../parsing/etherscan/etherscan_parseTransactions";

const params = {
    module: "account",
    action: "txlist",
    offset: "10000",
    apikey: `${process.env.ETHERSCAN_API_KEY}`,
};

export const get_etherscan_asset_transfers = async () => {
    global.is_fetching_etherscan_transactions = true;
    const startTime = performance.now();
    return fetch_1() as Promise<EtherscanResult[]>;
};

const fetch_1 = async () => {
    const url = new URL(`https://api.etherscan.io/api`);
    const tempParams: any = params;
    tempParams["address"] = `${global.walletAddress}`;
    url.search = new URLSearchParams(params).toString();
    const start = performance.now();
    const promise = axios
        .get(url.toString())
        .then((res) => res.data)
        .then((data) => {
            const end = performance.now();
            console.log(`Fetching etherscan took ${end - start} milliseconds`);
            if (data.result.length < params.offset) {
                global.is_fetching_etherscan_transactions = false;
            }
            return data.result;
        })
        .catch((error) => {
            console.log("error", error.code)
            global.request_aborted = true;
        });
    return promise;
};
