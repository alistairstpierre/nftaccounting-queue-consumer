import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynow from './json/x2y2/buynow.json'
import { tx_type } from '../util/nft-constants';
import { create_x2y2_transaction, is_x2y2_transaction } from '../util/parsing/covalent/transaction-types/x2y2/x2y2_transaction';

describe('mint tests', () => {
    const item:CovalentItem = buynow

    test('is x2y2 buynow', () => {
        expect(is_x2y2_transaction(item)).toEqual(true); 
    })

    test('create x2y2 buynow eth purchase', () => {
        global.walletAddress = "0x566d2c319036caf7331956a12ba118f44b046ea5".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_PURCHASE); 
    })

    test('create x2y2 buynow eth sale', () => {
        global.walletAddress = "0x72fae93d08a060a7f0a8919708c0db74ca46cbb6".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_SALE); 
    })
})