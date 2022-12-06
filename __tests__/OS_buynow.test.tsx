import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynow from './json/opensea/buynow.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = buynow

    test('is opensea buynow', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea buynow purchase', () => {
        global.walletAddress = "0x22d92ba22d03101decadf7cac1dc526becfee6c7".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_PURCHASE); 
    })

    test('create opensea buynow sale', () => {
        global.walletAddress = "0xab5f9071d325b9b5844d52cd4e55ea6bbaceb021".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_SALE); 
    })
})