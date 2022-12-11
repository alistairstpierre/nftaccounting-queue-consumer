import { CovalentItem, Transaction, EtherscanResult } from '../../../interfaces';
import { create_transaction } from '../../helpers';
import { tx_type } from '../../nft-constants';
import { AssetTransfersResult, NftSale } from 'alchemy-sdk';

export function parse_alchemy_market_transactions(data: Transaction[], alchemySales: NftSale[], alchemyPurchases: NftSale[]) {
    const transactions:Transaction[] = [];
    data.forEach((item) => {
        if(transactions.find((transaction) => transaction.tx_hash == item.tx_hash) == undefined){
            const matches = data.filter((transaction) => transaction.tx_hash == item.tx_hash)
            if(matches.length > 1) {
                transactions.push(create_transaction(
                    item.type,
                    item.tx_hash,
                    item.date,
                    item.block,
                    item.gas != undefined ? item.gas / matches.length : 0,
                    item.value != undefined ? item.value / matches.length : 0,
                ));
            } else {
                transactions.push(item);
            }
        }
    });
    // TODO add the sales and purchases to the transactions
    return transactions;
}
