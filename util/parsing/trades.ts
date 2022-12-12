import { Trade, Transaction } from "../../interfaces"
import { getExchangeFee } from "../helpers";
import { purchase_type, sale_type, tx_type } from "../nft-constants";

export function trades_parse(purchases: Transaction[], sales: Transaction[]) {
    const trades: Trade[] = [];
    const startTime = performance.now();
    for(const tx of purchases) {
        if(tx == undefined) continue;
        // if a transaction is a tx type, find its corresponding sale
        // get an array of potential matches
        const potentialMatches = sales.filter((t) => t.collection_contract === tx.collection_contract && t.token_id === tx.token_id)
        // order the array by date and find the first date after the tx date
        const potentialMatch = potentialMatches.sort((a, b) => +(a.date > b.date) || -(a.date < b.date)).filter((t) => t.date > tx.date);
        let match = undefined;
        if (potentialMatch.length > 0 && potentialMatch[0] != undefined) {
            match = potentialMatch[0];
        }

        const trade: Trade = {
            purchaseUUID: tx.uuid ? tx.uuid : `${tx.tx_hash}-${tx.collection_contract}-${tx.token_id}`,
            saleUUID: match != undefined ? (match.uuid ? match.uuid : `${match.tx_hash}-${tx.collection_contract}-${tx.token_id}`) : undefined,
            purchaseType: tx.type,
            purchaseTransaction: tx.tx_hash,
            saleType: match != undefined ? match.type : undefined,
            SaleTransaction: match != undefined ? match.tx_hash : undefined,
            imgUrl: undefined,
            tokenId: tx.token_id,
            projectAddress: tx.collection_contract,
            projectName: undefined,
            date: tx.date,
            cost: tx.value,
            sale: match != undefined ? match.value : undefined,
            feeGas: match != undefined ? (match.gas != undefined ? match.gas : 0) + (tx.gas != undefined ? tx.gas : 0) : 0,
            feeExchange: match != undefined ? match.market_fee : 0,
            feeRoyalty: match != undefined ? match.royalty : 0,
            contract: tx.category,
        };
        trades.push(trade);
    };
    const endTime = performance.now();
    console.log(`Parse Trades took ${endTime - startTime} milliseconds`);
    return { trades };
}