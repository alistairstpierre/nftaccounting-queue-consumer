import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bid from './json/looksrare/bid.json'
import broken from './json/looksrare/broken.json'
import { tx_type } from '../util/nft-constants';
import { create_looksrare_transaction, is_looksrare_transaction } from '../util/parsing/covalent/transaction-types/looksrare/lr_transaction';

describe('looksrare bid tests', () => {
    const item:CovalentItem = bid

    test('is looksrare', () => {
        expect(is_looksrare_transaction(item)).toEqual(true); 
    })

    test('create looksrare bid purchase', () => {
        global.walletAddress = "0x43a33125418b0de5bda8e4f30277e3cd31dc8a80".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BID_PURCHASE); 
    })

    test('create looksrare bid sale', () => {
        global.walletAddress = "0x698431cdbc791f169625ccd129c4fba3946c9a7d".toLowerCase();
        const obj = create_looksrare_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BID_SALE); 
    })

    const item2:CovalentItem = broken

    test('is looksrare', () => {
        expect(is_looksrare_transaction(item2)).toEqual(true); 
    })

    test('create looksrare bid purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_looksrare_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BID_PURCHASE); 
    })

    test('create looksrare bid sale', () => {
        global.walletAddress = "0x65fc19c3cc01aad1521ab3bf37d2cbbafde573e6".toLowerCase();
        const obj = create_looksrare_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.LOOKSRARE_BID_SALE); 
    })
})