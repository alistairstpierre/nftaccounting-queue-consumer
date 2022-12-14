import { CovalentItem, Transaction, EtherscanResult, NFTPortResult } from '../../interfaces';
import { tx_type } from '../nft-constants';
import { AssetTransfersCategory, AssetTransfersResult, NftSale, NftSaleMarketplace, NftSaleTakerType } from 'alchemy-sdk';

export function parse_transactions(data: [EtherscanResult[], EtherscanResult[], EtherscanResult[], EtherscanResult[], AssetTransfersResult[], NftSale[], NftSale[], NFTPortResult[]]) {
    const alchemyTransfers: AssetTransfersResult[] = data[4].flat()
    const alchemySales: NftSale[] = data[5]
    const alchemyPurchases: NftSale[] = data[6]
    const etherscanTransactions: EtherscanResult[] = data[0].concat(data[1])
    const etherscanNFTTransactions: EtherscanResult[] = data[2].concat(data[3])
    const nftPortTransactions: NFTPortResult[] = data[7]
    const transactions = <Transaction[]>[];
    for (const item of data[0]) {
        if (transactions.find((tx) => tx.tx_hash == item.hash) != undefined) continue;
        if (new Date(Number(item.timeStamp) * 1000) <= global.request_date && Number(item.blockNumber) <= global.request_block) continue;
        for (const transfer of alchemyTransfers) {
            if (item.hash == transfer.hash) {
                if (transfer.from == '0x0000000000000000000000000000000000000000' && transfer.tokenId != null) {
                    transactions.push({
                        type: tx_type.MINT,
                        tx_hash: item.hash,
                        block: item.blockNumber,
                        date: new Date(Number(item.timeStamp) * 1000),
                        gas: Number(item.gasUsed) * Number(item.gasPrice),
                        value: Number(item.value),
                        collection_contract: transfer.rawContract.address ? transfer.rawContract.address : undefined,
                        token_id: transfer.tokenId ? Number(transfer.tokenId).toString() : undefined,
                        uuid: transfer.uniqueId,
                        category: transfer.category,
                    });
                }
            }
        }
        if (transactions.find((tx) => tx.tx_hash == item.hash) != undefined) continue;
        if (item.isError == "1") {
            transactions.push({
                type: tx_type.FAILURE,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("swap")
            || item.functionName.toLowerCase().includes("multicall")) {
            transactions.push({
                type: tx_type.SWAP,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
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
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("approv")) {
            transactions.push({
                type: tx_type.LISTING,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("stake")) {
            transactions.push({
                type: tx_type.STAKE,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName.toLowerCase().includes("cancel")) {
            transactions.push({
                type: tx_type.CANCELLED,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        }
    }

    const purchases: Transaction[] = [];
    const sales: Transaction[] = [];
    const other: Transaction[] = [];
    for (const item of transactions) {
        if (item.type != tx_type.MINT) {
            continue;
        }
        if (purchases.find((purchases) => purchases.tx_hash == item.tx_hash) != undefined) {
            continue;
        }
        const matches = transactions.filter((transaction) => transaction.tx_hash == item.tx_hash)
        // check if its a mint
        if (matches.length > 1) {
            for (const match of matches) {
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
                    uuid: match.uuid,
                });
            }
        } else {
            purchases.push(item);
        }
    }
    for (const purchase of alchemyPurchases.flat()) {
        if (purchases.find((p) => p.tx_hash == purchase.transactionHash) != undefined) continue;
        const dataMatch = etherscanNFTTransactions.filter((item) => item.hash == purchase.transactionHash);
        if (dataMatch.length == 0) continue;
        const type = getPurchaseType(purchase);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == purchase.transactionHash);
        if (new Date(Number(dataMatch[0].timeStamp) * 1000) <= global.request_date && Number(dataMatch[0].blockNumber) <= global.request_block) continue;
        for (const item of dataMatch) {
            purchases.push({
                type: type,
                tx_hash: purchase.transactionHash,
                block: purchase.blockNumber.toString(),
                date: new Date(Number(dataMatch[0].timeStamp) * 1000),
                gas: purchase.taker == NftSaleTakerType.BUYER ? Number(item.gas) / dataMatch.length : 0,
                value: Number(purchase.sellerFee.amount) / dataMatch.length,
                collection_contract: purchase.contractAddress,
                token_id: item.tokenID,
                market_fee: 0,
                royalty: 0,
                marketplace: purchase.marketplace,
                category: transfersMatch?.category,
            });
        }
    }

    for (const sale of alchemySales.flat()) {
        if (sales.find((s) => s.tx_hash == sale.transactionHash) != undefined) continue;

        const dataMatch = etherscanNFTTransactions.filter((item) => item.hash == sale.transactionHash);
        if (dataMatch.length == 0) continue;
        const type = getPurchaseType(sale);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == sale.transactionHash);
        if (new Date(Number(dataMatch[0].timeStamp) * 1000) <= global.request_date && Number(dataMatch[0].blockNumber) <= global.request_block) continue;
        for (const item of dataMatch) {
            sales.push({
                type: type,
                tx_hash: sale.transactionHash,
                block: sale.blockNumber.toString(),
                date: new Date(Number(dataMatch[0].timeStamp) * 1000),
                gas: sale.taker == NftSaleTakerType.BUYER ? 0 : Number(item.gas) / dataMatch.length,
                value: Number(sale.sellerFee.amount) / dataMatch.length,
                collection_contract: sale.contractAddress,
                token_id: item.tokenID,
                market_fee: sale.marketplaceFee ? Number(sale.marketplaceFee?.amount) / dataMatch.length : 0,
                royalty: sale.royaltyFee ? Number(sale.royaltyFee?.amount) / dataMatch.length : 0,
                marketplace: sale.marketplace,
                category: transfersMatch?.category,
                uuid: transfersMatch?.uniqueId,
            });
        }
    }

    for (const item of nftPortTransactions.flat()) {
        if (item.buyer_address.toLowerCase() == global.walletAddress.toLowerCase()) {
            if (purchases.find((purchases) => purchases.tx_hash == item.transaction_hash) != undefined) continue;
            const nftMatch = nftPortTransactions.flat().filter((tx) => tx.transaction_hash == item.transaction_hash);
            const etherscanMatch = etherscanTransactions.find((tx) => item.transaction_hash == tx.hash);
            if (nftMatch.length == 0) continue;
            for (const nft of nftMatch) {
                const type = getNFTPortPurchaseType(nft);
                purchases.push({
                    type: type,
                    tx_hash: item.transaction_hash,
                    block: item.block_number.toString(),
                    date: new Date(item.transaction_date),
                    gas: etherscanMatch?.gasPrice ? (Number(etherscanMatch?.gasUsed) * Number(etherscanMatch?.gasPrice) / nftMatch.length) : 0,
                    value: Number(etherscanMatch?.value) / nftMatch.length,
                    collection_contract: item.nft.contract_address,
                    token_id: nft.nft.token_id,
                    category: item.nft.contract_type.toLowerCase() as AssetTransfersCategory,
                    royalty: 0,
                    marketplace: nft.marketplace,
                });
            }
        }
        else if (item.seller_address.toLowerCase() == global.walletAddress.toLowerCase()) {
            if (sales.find((sales) => sales.tx_hash == item.transaction_hash) != undefined) continue;
            const nftMatch = nftPortTransactions.flat().filter((tx) => tx.transaction_hash == item.transaction_hash);
            const etherscanMatch = etherscanTransactions.find((tx) => item.transaction_hash == tx.hash);
            if (nftMatch.length == 0) continue;
            for (const nft of nftMatch) {
                const type = getNFTPortSaleType(nft);
                sales.push({
                    type: type,
                    tx_hash: item.transaction_hash,
                    block: item.block_number.toString(),
                    date: new Date(item.transaction_date),
                    gas: 0,
                    value: Number(etherscanMatch?.value) / nftMatch.length,
                    collection_contract: item.nft.contract_address,
                    token_id: nft.nft.token_id,
                    category: item.nft.contract_type.toLowerCase() as AssetTransfersCategory,
                    royalty: item.nft.royalties ? (Number(item.nft.royalties[0].royalty_share) / 100000) * (Number(etherscanMatch?.value) / nftMatch.length) : 0,
                    marketplace: nft.marketplace,
                });
            }
        }
    }

    for (const item of transactions) {
        if (purchases.find((purchases) => purchases.tx_hash == item.tx_hash) == undefined && sales.find((sales) => sales.tx_hash == item.tx_hash) == undefined) {
            // check if date is greater than global.request date and block is greater than global.request block
            other.push(item);
        }
    };

    for (const item of etherscanNFTTransactions.flat()) {
        if (purchases.find((purchases) => purchases.tx_hash == item.hash) != undefined) continue;
        if (sales.find((sales) => sales.tx_hash == item.hash) != undefined) continue;
        if (other.find((other) => other.tx_hash == item.hash) != undefined) continue;
        if (item.to.toLowerCase() != global.walletAddress.toLowerCase()) continue;
        if (item.tokenName == '') continue;
        const dataMatch = etherscanNFTTransactions.flat().filter((tx) => tx.hash == item.hash);
        if (dataMatch.length == 0) continue;
        for (const data of dataMatch) {
            purchases.push({
                type: tx_type.TRANSFER,
                tx_hash: data.hash,
                block: data.blockNumber.toString(),
                date: new Date(Number(data.timeStamp) * 1000),
                gas: 0,
                value: 0,
                collection_contract: data.contractAddress,
                token_id: data.tokenID,
                category: AssetTransfersCategory.INTERNAL,
                royalty: 0,
            })
        }
    }

    for (const item of etherscanNFTTransactions) {
        if (item.from.toLowerCase() == global.walletAddress.toLowerCase()) {
            // sale
            if (sales.find((s) => s.tx_hash == item.hash) != undefined) continue;
            if (item.to == '0x0000000000000000000000000000000000000000') continue; // burn
            const normalEtherscanMatch = etherscanTransactions.find((tx) => item.hash == tx.hash);
            const dataMatch = etherscanNFTTransactions.filter((tx) => tx.hash == item.hash);
            if (dataMatch.length == 0) continue;
            if (item.hash.toLowerCase() == ('0x23db65bfc9f02f004029ac7d4ea7a1ed1606943403d98ffd8bf8988bf3ec5fe6'.toLowerCase())) console.log(item, normalEtherscanMatch)
            for (const data of dataMatch) {
                sales.push({
                    type: tx_type.UNKNOWN_SALE,
                    tx_hash: item.hash,
                    block: item.blockNumber.toString(),
                    date: new Date(Number(item.timeStamp) * 1000),
                    gas: 0,
                    value: Number(normalEtherscanMatch?.value) / dataMatch.length,
                    collection_contract: data.contractAddress,
                    token_id: data.tokenID,
                    category: AssetTransfersCategory.INTERNAL,
                });
            }
        } else if (item.to.toLowerCase() == global.walletAddress.toLowerCase()) {
            // to
            if (purchases.find((p) => p.tx_hash == item.hash) != undefined) continue;
            const normalEtherscanMatch = etherscanTransactions.find((tx) => item.hash == tx.hash);
            const dataMatch = etherscanNFTTransactions.filter((tx) => tx.hash == item.hash);
            if (dataMatch.length == 0) continue;
            for (const data of dataMatch) {
                purchases.push({
                    type: tx_type.TRANSFER,
                    tx_hash: item.hash,
                    block: item.blockNumber.toString(),
                    date: new Date(Number(item.timeStamp) * 1000),
                    gas: normalEtherscanMatch?.gasPrice ? (Number(normalEtherscanMatch?.gasUsed) * Number(normalEtherscanMatch?.gasPrice) / dataMatch.length) : 0,
                    value: Number(normalEtherscanMatch?.value) / dataMatch.length,
                    collection_contract: data.contractAddress,
                    token_id: data.tokenID,
                    category: AssetTransfersCategory.INTERNAL,
                });
            }
        }
    }
    // let testMatch = etherscanNFTTransactions.filter((item) => item.contractAddress == ("0xF1536ab2Dd1Fc1Da5D77fec3ce29537f6ef0634b".toLowerCase()));
    // if(testMatch.length > 0) console.log("etherscannft test", testMatch);

    // let testMatch:any = etherscanTransactions.filter((item) => item.hash.toLowerCase() == ("0x0e3f6720073dff28c5200ea63390f5cd9a3ef7c7b3735523ead4f02f9ad8227a".toLowerCase()));
    // if(testMatch.length > 0) console.log("etherscan test", testMatch);

    // let testMatch = nftPortTransactions.filter((item) => item.nft != undefined ? item.nft.contract_address.toLowerCase() : "" == ("0x23db65bfc9f02f004029ac7d4ea7a1ed1606943403d98ffd8bf8988bf3ec5fe6".toLowerCase()));
    // if(testMatch.length > 0) console.log("nftport test", testMatch);

    // let testMatch = alchemyTransfers.filter((item) => item.rawContract.address?.toLowerCase() == ("0x0e3f6720073dff28c5200ea63390f5cd9a3ef7c7b3735523ead4f02f9ad8227a".toLowerCase()));
    // if(testMatch.length > 0) console.log("etherscannft test", testMatch);

    return { purchases, sales, other };
}

const getNFTPortSaleType = (sale: NFTPortResult) => {
    switch (sale.marketplace) {
        case NftSaleMarketplace.SEAPORT.toLowerCase() || 'opensea':
            return tx_type.OPENSEA_SALE;
        case NftSaleMarketplace.LOOKSRARE.toLowerCase():
            return tx_type.LOOKSRARE_SALE;
        case NftSaleMarketplace.X2Y2.toLowerCase():
            return tx_type.X2Y2_SALE;
        default:
            return tx_type.UNKNOWN_SALE;
    }
}

const getNFTPortPurchaseType = (sale: NFTPortResult) => {
    switch (sale.marketplace) {
        case NftSaleMarketplace.SEAPORT.toLowerCase() || 'opensea':
            return tx_type.OPENSEA_PURCHASE;
        case NftSaleMarketplace.LOOKSRARE.toLowerCase():
            return tx_type.LOOKSRARE_PURCHASE;
        case NftSaleMarketplace.X2Y2.toLowerCase():
            return tx_type.X2Y2_PURCHASE;
        default:
            return tx_type.UNKNOWN_PURCHASE;
    }
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
