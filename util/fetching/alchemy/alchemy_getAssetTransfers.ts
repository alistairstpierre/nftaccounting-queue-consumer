import axios from "axios";
import { Alchemy, AssetTransfersCategory, Network, AssetTransfersResponse, AssetTransfersResult } from "alchemy-sdk";

const fetch_1_alchemy = async (next: string | undefined) => {
    let pageKey = "";
    if (next != undefined) pageKey = next;

    const config = {
        apiKey: process.env.ALCHEMY_API_KEY,
        network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    try {
        const promise = await alchemy.core.getAssetTransfers({
            fromBlock: "0x0",
            toBlock: "latest",
            toAddress: global.walletAddress,
            excludeZeroValue: true,
            category: [AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
            pageKey: pageKey != "" ? pageKey : undefined,
        }).then((data) => {
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

const checkForBlockNum = (data: AssetTransfersResult[]) => {
    const blockFiltered: AssetTransfersResult[] = [];
    let contains = false;
    for (const nft of data) {
        if (Number(nft.blockNum) <= global.request_block) {
            contains = true;
        } else {
            blockFiltered.push(nft);
        }
    }
    return { contains: contains, data: blockFiltered };
}

export const get_alchemy_asset_transfers = async () => {
    global.is_fetching_asset_transfers = true;
    let next: string | undefined = undefined;
    const promise: any = [];
    let startTime = performance.now();
    while (global.is_fetching_asset_transfers) {
        await fetch_1_alchemy(next)
        .then((res) => {
            if (global.request_aborted) {
                return null;
            }
            next = (res as AssetTransfersResponse).pageKey
            if(next == (undefined || null)) global.is_fetching_asset_transfers = false;
            if (global.request_block == 0) {
                return (res as AssetTransfersResponse).transfers;
            }
            const blockCheck = checkForBlockNum((res as AssetTransfersResponse).transfers);
            if (blockCheck.contains) {
                global.is_fetching_asset_transfers = false;
            }
            return blockCheck.data;
        })
        .then((data) => promise.push(data));
    }
    const endTime = performance.now();
    console.log("alchemy call time", endTime - startTime);
    return Promise.all(promise);
};

