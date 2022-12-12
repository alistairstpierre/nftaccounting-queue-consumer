import { CovalentItem, Transaction, EtherscanResult } from '../../interfaces';
import { tx_type } from '../nft-constants';
import { AssetTransfersResult, NftSale, NftSaleMarketplace, NftSaleTakerType } from 'alchemy-sdk';

export function parse_transactions(data: [EtherscanResult[], EtherscanResult[], EtherscanResult[], EtherscanResult[], EtherscanResult[], AssetTransfersResult[], NftSale[], NftSale[]]) {
    const alchemyTransfers: AssetTransfersResult[] = data[5].flat()
    const alchemySales: NftSale[] = data[6]
    const alchemyPurchases: NftSale[] = data[7]
    const etherscanTransactions: EtherscanResult[] = data[0].concat(data[1], data[2], data[3], data[4])
    const transactions = <Transaction[]>[];
    for(const item of data[0]){
        if (transactions.find((tx) => tx.tx_hash == item.hash) != undefined) continue;
        alchemyTransfers.forEach((transfer) => {
            if (item.hash == transfer.hash) {
                if (transfer.from == '0x0000000000000000000000000000000000000000' && transfer.tokenId != null) {
                    transactions.push({
                        type: tx_type.MINT,
                        tx_hash: item.hash,
                        block: item.blockNumber,
                        date: new Date(Number(item.timeStamp)*1000),
                        gas: Number(item.gasUsed) * Number(item.gasPrice),
                        value: Number(item.value),
                        collection_contract: transfer.rawContract.address ? transfer.rawContract.address : undefined,
                        collection_name: transfer.asset ? transfer.asset : undefined,
                        token_id: transfer.tokenId ? Number(transfer.tokenId).toString() : undefined,
                        uuid: transfer.uniqueId,
                        category: transfer.category,
                    });
                }
            }
        });
        if (item.isError == "1") {
            transactions.push({
                type: tx_type.FAILURE,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("swap")
            || item.functionName.toLowerCase().includes("multicall")) {
            transactions.push({
                type: tx_type.SWAP,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes(("withdraw")) ||
            item.functionName.toLowerCase().includes(("deposit")) ||
            item.functionName.toLowerCase().includes(("move")) ||
            item.functionName == "") {
            transactions.push({
                type: tx_type.MISC,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("approv")) {
            transactions.push({
                type: tx_type.LISTING,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("stake")) {
            transactions.push({
                type: tx_type.STAKE,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("cancel")) {
            transactions.push({
                type: tx_type.CANCELLED,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp)*1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        }
    }

    const purchases: Transaction[] = [];
    const sales: Transaction[] = [];
    const other: Transaction[] = [];
    transactions.forEach((item) => {
        if (item.type == tx_type.MINT) {
            if (purchases.find((purchases) => purchases.tx_hash == item.tx_hash) == undefined) {
                const matches = transactions.filter((transaction) => transaction.tx_hash == item.tx_hash)
                // check if its a mint
                if (matches.length > 1) {
                    for(const match of matches) {
                        purchases.push({
                            type: item.type,
                            tx_hash: item.tx_hash,
                            block: item.block,
                            date: item.date,
                            gas: item.gas != undefined ? item.gas / matches.length : 0,
                            value: item.value != undefined ? item.value / matches.length : 0,
                            collection_contract: item.collection_contract,
                            token_id: match.token_id,
                            category: item.category,
                        });
                    }
                } else {
                    purchases.push(item);
                }
            }
        }
    });
    alchemyPurchases.flat().forEach((purchase) => {
        const type = getPurchaseType(purchase);
        const dataMatch = etherscanTransactions.find((item) => item.hash == purchase.transactionHash);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == purchase.transactionHash);
        if (dataMatch) {
            purchases.push({
                type: type,
                tx_hash: purchase.transactionHash,
                block: purchase.blockNumber.toString(),
                date: new Date(Number(dataMatch.timeStamp)*1000),
                gas: purchase.taker == NftSaleTakerType.BUYER ? Number(dataMatch.gas) : 0,
                value: Number(purchase.sellerFee.amount),
                collection_contract: purchase.contractAddress,
                token_id: purchase.tokenId,
                market_fee: 0,
                royalty: 0,
                marketplace: purchase.marketplace,
                category: transfersMatch?.category,
                uuid: transfersMatch?.uniqueId,
            });
        } else {
            console.log("error: no data match for purchase", purchase)
        }
    });
    alchemySales.flat().forEach((sale) => {
        const type = getPurchaseType(sale);
        const dataMatch = etherscanTransactions.find((item) => item.hash == sale.transactionHash);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == sale.transactionHash);
        if (dataMatch) {
            sales.push({
                type: type,
                tx_hash: sale.transactionHash,
                block: sale.blockNumber.toString(),
                date: new Date(Number(dataMatch.timeStamp)*1000),
                gas: sale.taker == NftSaleTakerType.BUYER ? 0 : Number(dataMatch.gas),
                value: Number(sale.sellerFee.amount),
                collection_contract: sale.contractAddress,
                token_id: sale.tokenId,
                market_fee: sale.marketplaceFee ? Number(sale.marketplaceFee?.amount) : 0,
                royalty: sale.royaltyFee ? Number(sale.royaltyFee?.amount) : 0,
                marketplace: sale.marketplace,
                category: transfersMatch?.category,
                uuid: transfersMatch?.uniqueId,
            });
        } else {
            console.log("error: no data match for sale", sale)
        }
    });

    transactions.forEach((item) => {
        if (purchases.find((purchases) => purchases.tx_hash == item.tx_hash) == undefined && sales.find((sales) => sales.tx_hash == item.tx_hash) == undefined) {
            other.push(item);
        }
    });
    return { purchases, sales, other };
}

const getSaleType = (sale: NftSale) => {
    switch (sale.marketplace) {
        case NftSaleMarketplace.SEAPORT:
            return sale.taker == NftSaleTakerType.BUYER ? tx_type.OPENSEA_SALE : tx_type.OPENSEA_BID_SALE;
        case NftSaleMarketplace.LOOKSRARE:
            return sale.taker == NftSaleTakerType.BUYER ? tx_type.LOOKSRARE_SALE : tx_type.LOOKSRARE_BID_SALE;
        case NftSaleMarketplace.X2Y2:
            return sale.taker == NftSaleTakerType.BUYER ? tx_type.X2Y2_SALE : tx_type.X2Y2_BID_SALE;
        case NftSaleMarketplace.UNKNOWN:
            return sale.taker == NftSaleTakerType.BUYER ? tx_type.UNKNOWN_SALE : tx_type.UNKNOWN_BID_SALE;
    }
}

const getPurchaseType = (purchase: NftSale) => {
    switch (purchase.marketplace) {
        case NftSaleMarketplace.SEAPORT:
            return purchase.taker == NftSaleTakerType.BUYER ? tx_type.OPENSEA_PURCHASE : tx_type.OPENSEA_BID_PURCHASE;
        case NftSaleMarketplace.LOOKSRARE:
            return purchase.taker == NftSaleTakerType.BUYER ? tx_type.LOOKSRARE_PURCHASE : tx_type.LOOKSRARE_BID_PURCHASE;
        case NftSaleMarketplace.X2Y2:
            return purchase.taker == NftSaleTakerType.BUYER ? tx_type.X2Y2_PURCHASE : tx_type.X2Y2_BID_PURCHASE;
        case NftSaleMarketplace.UNKNOWN:
            return purchase.taker == NftSaleTakerType.BUYER ? tx_type.UNKNOWN_PURCHASE : tx_type.UNKNOWN_BID_PURCHASE;
    }
}
