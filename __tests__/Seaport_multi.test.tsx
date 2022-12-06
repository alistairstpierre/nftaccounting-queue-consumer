import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import multipurchase from './json/opensea/seaport/multipurchase.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('seaport multi purchase tests', () => {
    const item:CovalentItem = multipurchase

    test('is opensea transaction', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea multi sale', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))
    })

    test('create opensea multi purchase', () => {
        global.walletAddress = "0x60dd9e1bc8869c5711d6018b44370682cc5834d6".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))
    })
});