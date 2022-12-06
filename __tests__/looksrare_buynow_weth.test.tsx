import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynowweth from './json/looksrare/buynowweth.json'
import buynowweth2 from './json/looksrare/buynowweth2.json'
import { tx_type } from '../util/nft-constants';
import { create_looksrare_transaction, is_looksrare_transaction } from '../util/parsing/covalent/transaction-types/looksrare/lr_transaction';

describe('looksrare tests', () => {
    const item:CovalentItem = buynowweth2

    test('is looksrare', () => {
        expect(is_looksrare_transaction(item)).toEqual(true); 
    })

    test('create looksrare buynow weth purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BUYNOW_WETH_PURCHASE); 
    })

    test('create looksrare buynow weth sale', () => {
        global.walletAddress = "0x98E3cb61729067E1B77b7f0d6DCD4eB113288469".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BUYNOW_WETH_SALE); 
    })
})