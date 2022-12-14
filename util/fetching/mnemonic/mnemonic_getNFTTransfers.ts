import axios from "axios";
import { NFTPortResult } from '../../../interfaces';

const options = {method: 'GET', headers: {accept: 'application/json', Authorization: `${process.env.MNEMONIC_API_KEY}`}};

const fetch_1_mnemonic = async (next: string | undefined) => {
    let pageKey = "";
    if (next != undefined) pageKey = `&continuation=${next}`;

    const query = new URLSearchParams({
        limit: 'string',
        offset: 'string',
        sortDirection: 'SORT_DIRECTION_ASC',
        blockTimestampGt: '2019-08-24T14:15:22Z',
        labelsAny: 'LABEL_MINT',
        tokenIsSpam: 'SPAM_EXCLUDE',
        party: 'PARTY_SENDER'
      }).toString();

    let url = new URL(`https://ethereum.rest.mnemonichq.com/transfers/v1beta1/nft?${query}`);

    const startTime = performance.now();
    try {
        const promise = await axios.get(url.toString(), options)
            .then((data) => {
                const endTime = performance.now();
                //console.log(`Fetching nftport transfers took ${endTime - startTime} milliseconds`);
                return data.data;
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

const checkForBlockNum = (data: NFTPortResult[]) => {
    const blockFiltered: NFTPortResult[] = [];
    let contains = false;
    for (const nft of data) {
        if (nft.block_number <= global.request_block) {
            contains = true;
        } else {
            blockFiltered.push(nft);
        }
    }
    return { contains: contains, data: blockFiltered };
}

export const get_mnemonic = async () => {
    let next: string | undefined = undefined;
    global.is_fetching_nftport = true;
    const promise: any = [];
    while (global.is_fetching_nftport) {
        await fetch_1_mnemonic(next)
            .then((res: any) => {
                if (global.request_aborted) {
                    return null;
                }
                next = res.continuation
                if (next == (undefined || null)) global.is_fetching_nftport = false;
                if (global.request_block == 0) {
                    return res.transactions as NFTPortResult[];
                }
                const blockCheck = checkForBlockNum(res.transactions);
                if (blockCheck.contains) {
                    global.is_fetching_asset_transfers = false;
                }
                return blockCheck.data;
            })
            .then((data) => promise.push(data));
    }
    const endTime = performance.now();
    return Promise.all(promise);
};

