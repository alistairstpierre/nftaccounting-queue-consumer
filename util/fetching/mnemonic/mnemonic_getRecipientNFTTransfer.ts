import axios from "axios";
import { NFTPortResult } from '../../../interfaces';

const options = {method: 'GET', headers: { 'X-API-Key': `${process.env.MNEMONIC_API_KEY}`}};
const offset = 500;

const fetch_1_mnemonic = async (next: string | undefined) => {
    let pageKey = "";
    if (next != undefined) pageKey = `&offset=${next}`;

    let query = new URLSearchParams({
        limit: '500',
        // offset: '0',
        sortDirection: 'SORT_DIRECTION_ASC',
        // blockTimestampGt: '2019-08-24T14:15:22Z',
        // contractAddress: 'string',
        // tokenId: 'string',
        // transferTypes: 'TRANSFER_TYPE_MINT',
        // tokenTypes: 'TOKEN_TYPE_ERC721',
        // senderAddress: `${global.walletAddress}`,
        recipientAddress: `${global.walletAddress}`,
        // labelsAny: 'LABEL_MINT'
      }).toString();

    let url = new URL(`https://ethereum.rest.mnemonichq.com/transfers/v1beta1/nft?${query}${pageKey}`);

    const startTime = performance.now();
    try {
        const promise = await axios.get(url.toString(), options)
            .then((data) => {
                const endTime = performance.now();
                //console.log(`Fetching nftport transfers took ${endTime - startTime} milliseconds`);
                return data.data.nftTransfers;
            }).catch(function (error) {
                console.error(error);
                global.request_aborted = true;
            });
        return promise;
    } catch (error: any) {
        console.log(error);
        global.request_aborted = true;
    }
};

const checkForBlockNum = (data: any) => {
    const blockFiltered: any = [];
    let contains = false;
    for (const nft of data) {
        if (Number(nft.blockchainEvent.blockNumber) <= global.request_block) {
            contains = true;
        } else {
            blockFiltered.push(nft);
        }
    }
    return { contains: contains, data: blockFiltered };
}

export const get_mnemonic_recipient_data = async () => {
    let next: number = 0;
    global.is_fetching_mnemonic_receiver_data = true;
    const startTime = performance.now();
    const promise: any = [];
    while (global.is_fetching_mnemonic_receiver_data) {
        await fetch_1_mnemonic(next.toString())
            .then((res: any) => {
                if (global.request_aborted) {
                    return null;
                }
                if (res.length < offset) global.is_fetching_mnemonic_receiver_data = false;
                next += offset;
                if (global.request_block == 0) {
                    return res;
                }
                const blockCheck = checkForBlockNum(res);
                if (blockCheck.contains) {
                    global.is_fetching_asset_transfers = false;
                }
                return blockCheck.data;
            })
            .then((data) => promise.push(data));
    }
    const endTime = performance.now();
    console.log(`Fetching mnemonic transfers took ${endTime - startTime} milliseconds`);
    return Promise.all(promise);
};

