import { CovalentItem, Transaction, EtherscanResult, NFTPortResult, MnemonicNftTransfer } from '../../interfaces';
import { tx_type } from '../nft-constants';
import { AssetTransfersCategory, AssetTransfersResult, NftSale, NftSaleMarketplace, NftSaleTakerType } from 'alchemy-sdk';
import { ethToGwei, ethToWei } from '../helpers';

export function parse_transactions(data: [EtherscanResult[], EtherscanResult[], EtherscanResult[], EtherscanResult[], AssetTransfersResult[], NftSale[], NftSale[], MnemonicNftTransfer[], MnemonicNftTransfer[]]) {
    const alchemyTransfers: AssetTransfersResult[] = data[4].flat(3)
    const alchemySales: NftSale[] = data[5].flat(3)
    const alchemyPurchases: NftSale[] = data[6].flat(3)
    const etherscanNormalTransactions = data[0] != undefined ? data[0].flat(3) : []
    const etherscanInternalTransactions = data[1] != undefined ? data[1].flat(3) : []
    const etherscanERC721Transactions = data[2] != undefined ? data[2].flat(3) : []     
    const etherscanERC1155Transactions = data[3] != undefined ? data[3].flat(3) : []
    const etherscanTransactions: EtherscanResult[] = etherscanNormalTransactions.concat(etherscanInternalTransactions)
    const etherscanNFTTransactions: EtherscanResult[] = etherscanERC721Transactions.concat(etherscanERC1155Transactions)
    const mnemonicNftTransfers: MnemonicNftTransfer[] = data[7].concat(data[8]).flat(3)
    const transactions = <Transaction[]>[];
    for (const item of etherscanNormalTransactions) {
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
        } else if (item.functionName?.toLowerCase().includes("swap")
            || item.functionName?.toLowerCase().includes("multicall")) {
            transactions.push({
                type: tx_type.SWAP,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName?.toLowerCase().includes(("withdraw")) ||
            item.functionName?.toLowerCase().includes(("deposit")) ||
            item.functionName?.toLowerCase().includes(("move")) ||
            item.functionName == "") {
            transactions.push({
                type: tx_type.MISC,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName?.toLowerCase().includes("approv")) {
            transactions.push({
                type: tx_type.LISTING,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName?.toLowerCase().includes("stake")) {
            transactions.push({
                type: tx_type.STAKE,
                tx_hash: item.hash,
                block: item.blockNumber,
                date: new Date(Number(item.timeStamp) * 1000),
                gas: Number(item.gasUsed) * Number(item.gasPrice),
            });
        } else if (item.functionName?.toLowerCase().includes("cancel")) {
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

    for (const purchase of alchemyPurchases) {
        if (purchases.find((p) => p.tx_hash == purchase.transactionHash) != undefined) continue;
        const dataMatch = etherscanNFTTransactions.filter((item) => item.hash == purchase.transactionHash);
        if (dataMatch.length == 0) continue;
        const type = getPurchaseType(purchase);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == purchase.transactionHash);
        if (new Date(Number(dataMatch[0].timeStamp) * 1000) <= global.request_date && Number(dataMatch[0].blockNumber) <= global.request_block) continue;
        for (const item of dataMatch) {
            // console.log(purchase, item.gas)
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
                collection_name: item.tokenName == '' || item.tokenName == undefined ? undefined : item.tokenName,
                marketplace: purchase.marketplace,
                category: transfersMatch?.category,
            });
        }
    }

    for (const sale of alchemySales) {
        if (sales.find((s) => s.tx_hash == sale.transactionHash) != undefined) continue;
        const dataMatch = etherscanNFTTransactions.filter((item) => item.hash == sale.transactionHash);
        if (dataMatch.length == 0) continue;
        const type = getSaleType(sale);
        const transfersMatch = alchemyTransfers.find((item) => item.hash == sale.transactionHash);
        if (new Date(Number(dataMatch[0].timeStamp) * 1000) <= global.request_date && Number(dataMatch[0].blockNumber) <= global.request_block) continue;
        for (let i = 0; i < dataMatch.length; i++) {
            // console.log(sale)
            sales.push({
                type: type,
                tx_hash: sale.transactionHash,
                block: sale.blockNumber.toString(),
                date: new Date(Number(dataMatch[0].timeStamp) * 1000),
                gas: sale.taker == NftSaleTakerType.BUYER ? 0 : Number(dataMatch[i].gas) / dataMatch.length,
                value: Number(sale.sellerFee.amount) / dataMatch.length,
                collection_contract: sale.contractAddress,
                token_id: dataMatch[i].tokenID,
                market_fee: sale.marketplaceFee ? Number(sale.marketplaceFee?.amount) / dataMatch.length : undefined,
                royalty: sale.royaltyFee ? Number(sale.royaltyFee?.amount) / dataMatch.length : 0,
                marketplace: sale.marketplace,
                category: transfersMatch?.category,
                uuid: transfersMatch?.uniqueId,
                collection_name:  dataMatch[i].tokenName == '' || dataMatch[i].tokenName == undefined ? undefined : dataMatch[i].tokenName,
            });
        }
    }

    for (const item of transactions) {
        if (purchases.find((purchases) => purchases.tx_hash == item.tx_hash) == undefined && sales.find((sales) => sales.tx_hash == item.tx_hash) == undefined) {
            // check if date is greater than global.request date and block is greater than global.request block
            other.push(item);
        }
    };

    for (const item of etherscanNFTTransactions) {
        if (item.from.toLowerCase() == global.walletAddress.toLowerCase()) {
            // sale
            if (sales.find((s) => s.tx_hash == item.hash) != undefined) continue;
            if (item.to == '0x0000000000000000000000000000000000000000') continue; // burn
            const normalEtherscanMatch = etherscanTransactions.find((tx) => item.hash == tx.hash);
            const mnemonicNftTransfer = mnemonicNftTransfers.find((tx) => item.hash == tx.blockchainEvent.txHash);
            let mnemonicMarketAndRoyalty = undefined
            let mnemonicType = tx_type.UNKNOWN_SALE;
            if(mnemonicNftTransfer != undefined){
                mnemonicMarketAndRoyalty = getMnemonicRoyaltyAndMarketFee(mnemonicNftTransfer);
                mnemonicType = mnemonicNftTransfer.labels.includes('LABEL_TRANSFER') ? tx_type.TRANSFER : tx_type.UNKNOWN_SALE;
            }
            const dataMatch = etherscanNFTTransactions.filter((tx) => tx.hash == item.hash);
            if (dataMatch.length == 0) continue;
            for (const data of dataMatch) {
                sales.push({
                    type: mnemonicType,
                    tx_hash: item.hash,
                    block: item.blockNumber.toString(),
                    date: new Date(Number(item.timeStamp) * 1000),
                    gas: 0,
                    value: mnemonicNftTransfer != undefined ? Math.round(ethToWei(Number(mnemonicNftTransfer.recipientPaid.totalEth))) 
                    : Number(normalEtherscanMatch?.value) > 0 ? Number(normalEtherscanMatch?.value) / dataMatch.length : 0,
                    collection_contract: data.contractAddress,
                    token_id: data.tokenID,
                    collection_name: data.tokenName == '' || data.tokenName == undefined ? undefined : data.tokenName,
                    category: AssetTransfersCategory.INTERNAL,
                    royalty: mnemonicMarketAndRoyalty != undefined ? Math.round(mnemonicMarketAndRoyalty.royalty / dataMatch.length) : 0,
                    market_fee: mnemonicMarketAndRoyalty != undefined ? Math.round(mnemonicMarketAndRoyalty.marketFee / dataMatch.length) : undefined,
                });
            }
        } else if (item.to.toLowerCase() == global.walletAddress.toLowerCase()) {
            // to
            if (purchases.find((p) => p.tx_hash == item.hash) != undefined) continue;
            if (item.tokenName == '') continue;
            const normalEtherscanMatch = etherscanTransactions.find((tx) => item.hash == tx.hash);
            if(normalEtherscanMatch?.functionName?.includes('move')) continue;
            const dataMatch = etherscanNFTTransactions.filter((tx) => tx.hash == item.hash);
            if (dataMatch.length == 0) continue;
            for (const data of dataMatch) {
                purchases.push({
                    type: tx_type.TRANSFER,
                    tx_hash: item.hash,
                    block: item.blockNumber.toString(),
                    date: new Date(Number(item.timeStamp) * 1000),
                    gas: normalEtherscanMatch?.gasPrice ? (Number(normalEtherscanMatch?.gasUsed) * Number(normalEtherscanMatch?.gasPrice) / dataMatch.length) : 0,
                    value: Number(normalEtherscanMatch?.value) > 0 ? Number(normalEtherscanMatch?.value) / dataMatch.length : 0,
                    collection_contract: data.contractAddress,
                    token_id: data.tokenID,
                    collection_name: data.tokenName == '' || data.tokenName == undefined ? undefined : data.tokenName,
                    category: AssetTransfersCategory.INTERNAL,
                });
            }
        }
    }

    // const p = purchases.find((p) => p.tx_hash == "0xc61757a3675ef08091dcc1ff9744b9893504938b481842d49fe4636f95c41462")
    // if(p != undefined) console.log(p)

    // const s = sales.filter((s) => s.type == tx_type.TRANSFER)
    // if(s.length > 0) console.log("sales with transfer", s)

    // console.log("after etherscanNFT", purchases.length, sales.length)

    // for (const item of mnemonicNftTransfers) {
    //     console.log(item)
    // }

    // let testMatch:any = etherscanNFTTransactions.filter((item) => item.contractAddress.toLowerCase() == ("0xf36C296E87Dd2D7aDcEf251a542561D4BBe07714".toLowerCase()));
    // if(testMatch.length > 0) console.log("etherscannft test", testMatch);

    // testMatch = alchemySales.filter((item) => item.contractAddress.toLowerCase() == ("0xf36C296E87Dd2D7aDcEf251a542561D4BBe07714".toLowerCase()));
    // if(testMatch.length > 0) console.log("alchemySales test", testMatch);

    // testMatch = mnemonicNftTransfers.filter((item) => item.contractAddress == ("0xf36C296E87Dd2D7aDcEf251a542561D4BBe07714".toLowerCase()));
    // if(testMatch.length > 0) console.log("mnemonicsNFT test", testMatch);

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

const MarketPlaceLabels = {
    OPENSEA: 'LABEL_MARKETPLACE_OPENSEA',
    LOOKSRARE: 'LABEL_MARKETPLACE_LOOKSRARE',
    X2Y2: 'LABEL_MARKETPLACE_X2Y2',
    RARIBLE: 'LABEL_MARKETPLACE_RARIBLE',
    SUPERRARE: 'LABEL_MARKETPLACE_SUPERRARE',
    CRYPTOPUNKS: 'LABEL_MARKETPLACE_CRYPTOPUNKS',
    ARTBLOCKS: 'LABEL_MARKETPLACE_ARTBLOCKS',
}

function getMnemonicRoyaltyAndMarketFee(arg0: MnemonicNftTransfer) {
    const price = Number(arg0.recipientPaid.totalEth);
    const recieved = Number(arg0.senderReceived.totalEth);
    let marketFee = 0;
    if(arg0.labels.includes(MarketPlaceLabels.OPENSEA)) {
        marketFee = price * 0.025;
    } else if(arg0.labels.includes(MarketPlaceLabels.LOOKSRARE)) {
        marketFee = price * 0.02;
    } else if(arg0.labels.includes(MarketPlaceLabels.X2Y2)) {
        marketFee = price * 0.005;
    } else if(arg0.labels.includes(MarketPlaceLabels.RARIBLE)) {
        marketFee = price * 0.01;
    }
    const royalty = ethToWei(price - recieved - marketFee);
    marketFee = ethToWei(marketFee);
    return { royalty, marketFee };
}


