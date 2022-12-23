import axios from "axios";
import { NFTPortResult } from '../../../interfaces';

const options = {method: 'GET', headers: { 'X-API-Key': `${process.env.MNEMONIC_API_KEY}`}};
const offset = 500;
const fetch_amount = 15;

const fetch_1_mnemonic = async (next: string | undefined) => {
    let pageOffset = "";
    if (next != undefined) pageOffset = `&offset=${next}`;

    const tokenTypes = `&tokenTypes=TOKEN_TYPE_ERC721&tokenTypes=TOKEN_TYPE_ERC1155`;

    let query = new URLSearchParams({
        limit: '500',
        // offset: '0',
        sortDirection: 'SORT_DIRECTION_ASC',
        // blockTimestampGt: '2019-08-24T14:15:22Z',
        // contractAddress: 'string',
        // tokenId: 'string',
        transferTypes: 'TRANSFER_TYPE_REGULAR',
        // senderAddress: `${global.walletAddress}`,
        recipientAddress: `${global.walletAddress}`,
        // labelsAny: 'LABEL_MINT'
      }).toString();

    let url = new URL(`https://ethereum.rest.mnemonichq.com/transfers/v1beta1/nft?${query}${pageOffset}${tokenTypes}`);

    const startTime = performance.now();
    // console.log(`start mnemonic reciever data fetch for pages: ${next}-${Number(next)+offset}`);
    try {
        const promise = await axios.get(url.toString(), options)
            .then((data) => {
                if (global.request_aborted) {
                    return null;
                }
                // console.log(`page: ${next}-${Number(next)+offset} of mnemonic reciever data has ${data.data.nftTransfers.length} entries`)
                if (data.data.nftTransfers.length < offset){
                    global.is_fetching_mnemonic_receiver_data = false;
                } 
                const endTime = performance.now();
                // console.log(`Fetching mnemonic reciever data ${next}-${Number(next)+offset} took ${endTime - startTime} milliseconds`);
                if (global.request_block == 0) {
                    return data.data.nftTransfers;
                }
                const blockCheck = checkForBlockNum(data.data.nftTransfers);
                if (blockCheck.contains) {
                    global.is_fetching_mnemonic_receiver_data = false;
                }
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

const fetch_multi = async (start: number) => {
    const promise = [];
    for(let i = start; i < start + fetch_amount; i++) {
        promise.push(fetch_1_mnemonic((i*offset).toString()));
    }
    return Promise.all(promise);
}

const sleep = (seconds: number) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const get_mnemonic_recipient_data = async () => {
    let next: number = 0;
    global.is_fetching_mnemonic_receiver_data = true;
    const startTime = performance.now();
    const promise: any = [];
    while (global.is_fetching_mnemonic_receiver_data) {
        promise.push(fetch_multi(next));
        await sleep(1);
        next += fetch_amount;
    }
    const endTime = performance.now();
    console.log(`Fetching mnemonic reciever data took ${endTime - startTime} milliseconds`);
    return Promise.all(promise);
};

