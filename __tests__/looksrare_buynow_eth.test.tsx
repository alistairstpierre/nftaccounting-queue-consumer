import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynoweth from './json/looksrare/buynoweth.json'
import { tx_type } from '../util/nft-constants';
import { create_looksrare_transaction, is_looksrare_transaction } from '../util/parsing/covalent/transaction-types/looksrare/lr_transaction';

describe('mint tests', () => {
    const item:CovalentItem = buynoweth

    test('is looksrare', () => {
        expect(is_looksrare_transaction(item)).toEqual(true); 
    })

    test('create looksrare buynow eth purchase', () => {
        global.walletAddress = "0xc23b78f47cbf3f4ccf3bfe5899dd6a20c308ceb5".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BUYNOW_ETH_PURCHASE); 
    })

    test('create looksrare buynow eth sale', () => {
        global.walletAddress = "0x43a33125418b0de5bda8e4f30277e3cd31dc8a80".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BUYNOW_ETH_SALE); 
    })
})