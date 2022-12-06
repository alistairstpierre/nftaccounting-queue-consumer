import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bundleweth from './json/x2y2/bundleweth.json'
import bundleeth from './json/x2y2/bundleeth.json'
import { tx_type } from '../util/nft-constants';
import { create_x2y2_transaction, is_x2y2_transaction } from '../util/parsing/covalent/transaction-types/x2y2/x2y2_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bundleweth
    const item2:CovalentItem = bundleeth

    test('is x2y2 bundle', () => {
        expect(is_x2y2_transaction(item)).toEqual(true); 
        expect(is_x2y2_transaction(item2)).toEqual(true); 
    })

    test('create x2y2 bundle weth purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_PURCHASE); 
    })

    test('create x2y2 bundle weth sale', () => {
        global.walletAddress = "0xc41e114ae06e1dcb884d9ff25c4937a3f85abe9f".toLowerCase();
        const obj = create_x2y2_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_SALE); 
    })

    test('create x2y2 bundle eth purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_x2y2_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_PURCHASE); 
    })

    test('create x2y2 bundle eth sale', () => {
        global.walletAddress = "0xc41e114ae06e1dcb884d9ff25c4937a3f85abe9f".toLowerCase();
        const obj = create_x2y2_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.X2Y2_BUYNOW_SALE); 
    })
})