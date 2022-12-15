import axios from "axios";
import { EtherscanResult } from "../../../interfaces";

const params = {
    module: "account",
    action: "txlistinternal",
    offset: "10000",
    apikey: `${process.env.ETHERSCAN_API_KEY}`,
};

export const get_etherscan_internal_transactions = async () => {
    global.is_fetching_etherscan_transactions = true;
    const startTime = performance.now();
    return fetch_1() as Promise<EtherscanResult[]>;
};

const checkForBlockNum = (data: EtherscanResult[]) => {
    const blockFiltered: EtherscanResult[] = [];
    let contains = false;
    for (const nft of data) {
        if (Number(nft.blockNumber) <= global.request_block) {
            contains = true;
        } else {
            blockFiltered.push(nft);
        }
    }
    return { contains: contains, data: blockFiltered };
}

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
            console.log(`Fetching etherscan internal took ${end - start} milliseconds`);
            if (global.request_block == 0) {
                return data.result;
            }
            const blockCheck = checkForBlockNum(data.result);
            return blockCheck.data;
        })
        .catch((error) => {
            console.log("error", error.code)
            global.request_aborted = true;
        });
    return promise;
};
