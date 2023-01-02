import { match } from "assert";
import { Trade, Transaction } from "../../interfaces"
import { getExchangeFee } from "../helpers";
import { purchase_type, sale_type, tx_type } from "../nft-constants";

const getMarketFee = (marketplace: string | undefined, match: Transaction | undefined) => {
    if (marketplace == undefined || match == undefined) return 0;
    if (marketplace.toLowerCase().includes("opensea")) return 0.025 * (match.value ? match.value : 0);
    if (marketplace.toLowerCase().includes("rarible")) return 0.01 * (match.value ? match.value : 0);
    if (marketplace.toLowerCase().includes("looksrare")) return 0.02 * (match.value ? match.value : 0);
    if (marketplace.toLowerCase().includes("x2y2")) return 0.005 * (match.value ? match.value : 0);
    return 0;
}

export function trades_parse(purchases: Transaction[], sales: Transaction[]) {
    const trades: Trade[] = [];
    const startTime = performance.now();
    for (const tx of purchases) {
        if (tx == undefined) continue;
        // if a transaction is a tx type, find its corresponding sale
        // get an array of potential matches
        const potentialMatches = sales.filter((t) => t.collection_contract === tx.collection_contract && t.token_id === tx.token_id)
        // order the array by date and find the first date after the tx date
        const potentialMatch = potentialMatches.sort((a, b) => +(a.date > b.date) || -(a.date < b.date)).filter((t) => t.date > tx.date);
        let match = undefined;
        if (potentialMatch.length > 0 && potentialMatch[0] != undefined) {
            match = potentialMatch[0];
        }

        let projectName = ""
        if (tx.collection_name != undefined && tx.collection_name != "") {
            projectName = tx.collection_name;
        } else if (match != undefined && match.collection_name != undefined && match.collection_name != "") {
            projectName = match.collection_name;
        }

        const trade: Trade = {
            purchaseUUID: `${global.walletAddress}-${tx.tx_hash}-${tx.collection_contract}-${tx.token_id}`,
            saleUUID: match != undefined ? `${global.walletAddress}-${match.tx_hash}-${tx.collection_contract}-${tx.token_id}` : undefined,
            purchaseType: tx.type,
            purchaseTransaction: tx.tx_hash,
            saleType: match != undefined ? match.type : undefined,
            SaleTransaction: match != undefined ? match.tx_hash : undefined,
            imgUrl: undefined,
            tokenId: tx.token_id,
            projectAddress: tx.collection_contract,
            projectName: projectName,
            purchaseDate: tx.date,
            saleDate: match != undefined ? match.date : undefined,
            purchaseBlock: Number(tx.block),
            saleBlock: match != undefined ? Number(match.block) : undefined,
            cost: tx.value,
            sale: match != undefined ? match.value : undefined,
            feeGas: match != undefined ? (match.gas != undefined ? match.gas : 0) + (tx.gas != undefined ? tx.gas : 0) : 0,
            feeExchange: match != undefined ? (match.market_fee != undefined ? match.market_fee : getMarketFee(match.marketplace, match)) : 0,
            feeRoyalty: match != undefined ? (match.royalty != undefined ? match.royalty : 0) : 0,
            contract: tx.category,
        };
        trades.push(trade);
    };

    for (const trade of trades) {
        const t = trades.filter((t: Trade) => t.purchaseUUID == trade.purchaseUUID);
        if (t.length > 1) {
            for (let i = 0; i < t.length; i++) {
                t[i].purchaseUUID = `${t[i].purchaseUUID}-${i}`;
            }
        }

        const s = trades.filter((t: Trade) => trade.saleUUID != undefined && t.saleUUID == trade.saleUUID);
        if (s.length > 1) {
            for (let i = 0; i < s.length; i++) {
                s[i].saleUUID = `${s[i].saleUUID}-${i}`;
            }
        }
    }

    //console.log(trades)
    for (const trade of trades) {
        const match = trades.filter((t: Trade) => t.purchaseUUID == trade.purchaseUUID);
        if (match.length > 1) {
            console.log(match);
        }

    }

    const endTime = performance.now();
    console.log(`Parse Trades took ${endTime - startTime} milliseconds`);
    return { trades };
}