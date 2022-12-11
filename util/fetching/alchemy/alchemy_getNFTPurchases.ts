import axios from "axios";
import { Alchemy, Network, AssetTransfersResponse, GetNftSalesResponse, NftSale } from "alchemy-sdk";

const fetch_1_alchemy = async (next: string | undefined) => {
    let pageKey = "";
    if (next != undefined) pageKey = next;

    const config = {
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);

    const startTime = performance.now();
    try {
        const promise = await alchemy.nft.getNftSales({
            fromBlock: 0,
            toBlock: "latest",
            buyerAddress: global.walletAddress,
            pageKey: pageKey != "" ? pageKey : undefined,
        }).then((data) => {
            const endTime = performance.now();
            console.log(`Fetching alchemy asset transfers took ${endTime - startTime} milliseconds`);
            return data;
        }).catch(function (error) {
            console.error(error);
            global.request_aborted = true;
        });
        return promise;
    } catch (error) {
        console.log(error);
        global.request_aborted = true;
    }
};

const checkForBlockNum = (data: NftSale[]) => {
    const blockFiltered: NftSale[] = [];
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

export const get_alchemy_nft_purchases = async () => {
    global.is_fetching_nft_purchases = true;
    let next: string | undefined = undefined;
    const promise: any = [];
    while (global.is_fetching_nft_purchases) {
        await fetch_1_alchemy(next)
        .then((res) => {
            if (global.request_aborted) {
                return null;
            }
            next = (res as GetNftSalesResponse).pageKey
            if(next == (undefined || null)) global.is_fetching_nft_purchases = false;
            console.log("next", next);
            if (global.request_block == 0) {
                return (res as GetNftSalesResponse).nftSales;
            }
            const blockCheck = checkForBlockNum((res as GetNftSalesResponse).nftSales);
            if (blockCheck.contains) {
                global.is_fetching_nft_purchases = false;
            }
            return blockCheck.data;
        })
        .then((data) => promise.push(data));
    }
    const endTime = performance.now();
    return Promise.all(promise);
};

