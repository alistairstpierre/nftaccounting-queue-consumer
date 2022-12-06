import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynowweth from './json/x2y2/buynowweth.json'
import { tx_type } from '../util/nft-constants';
import { create_x2y2_transaction, is_x2y2_transaction } from '../util/parsing/covalent/transaction-types/x2y2/x2y2_transaction';

describe('x2y2 tests', () => {
    const item:CovalentItem = buynowweth

    test('is x2y2 tx', () => {
        expect(is_x2y2_transaction(item)).toEqual(true); 
    })

    test('create x2y2 buynow weth purchase', () => {
        global.walletAddress = "0x2a7e7e6e978c126bbb0549f7ed98b6b89d0366e3".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_PURCHASE); 
    })

    test('create x2y2 buynow weth sale', () => {
        global.walletAddress = "0x99fdb1af7389c345c6ef06d527157a47638b879e".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_SALE); 
    })
})