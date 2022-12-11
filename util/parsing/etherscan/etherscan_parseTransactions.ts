import { CovalentItem, Transaction, EtherscanResult } from '../../../interfaces';
import { create_transaction } from '../../helpers';
import { tx_type } from '../../nft-constants';
import { AssetTransfersResult } from 'alchemy-sdk';

export function parse_etherscan_transactions(data: EtherscanResult[], alchemyTransfers: AssetTransfersResult[]) {
    const transactions = <Transaction[]>[];
    data.forEach((item) => {
        alchemyTransfers.flat().forEach((transfer) => {
            if (item.hash == transfer.hash) {
                console.log(transfer.from);
                if(transfer.from == '0x0000000000000000000000000000000000000000') {
                    transactions.push(create_transaction(
                        tx_type.MINT,
                        item.hash,
                        item.timeStamp,
                        item.blockNumber,
                        Number(item.gasUsed) * Number(item.gasPrice),
                        Number(item.value)
                    ))
                }
            }
        });
        if (item.isError == "1") {
            transactions.push(create_transaction(
                tx_type.FAILURE,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        } else if (item.functionName.toLowerCase().includes("swap")
            || item.functionName.toLowerCase().includes("multicall")) {
            transactions.push(create_transaction(
                tx_type.SWAP,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        } else if (item.functionName.toLowerCase().includes(("withdraw")) || 
        item.functionName.toLowerCase().includes(("deposit")) || 
        item.functionName.toLowerCase().includes(("move")) ||
        item.functionName == "") {
            transactions.push(create_transaction(
                tx_type.MISC,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        } else if(item.functionName.toLowerCase().includes("approv")) {
            transactions.push(create_transaction(
                tx_type.LISTING,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        } else if (item.functionName.toLowerCase().includes("stake")) {
            transactions.push(create_transaction(
                tx_type.STAKE,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        } else if (item.functionName.toLowerCase().includes("cancel")) {
            transactions.push(create_transaction(
                tx_type.CANCELLED,
                item.hash,
                item.timeStamp,
                item.blockNumber,
                Number(item.gasUsed) * Number(item.gasPrice),
            ));
        }
        else if (!item.functionName.toLowerCase().includes(("atomic")) && !item.functionName.toLowerCase().includes(("transfer"))){
            //console.log(item.functionName, item.hash, item.to);
        }
    });
    return transactions;
}
