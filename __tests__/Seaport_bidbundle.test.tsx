import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bidbundle from './json/opensea/seaport/bidbundle.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bidbundle


    test('is opensea transaction', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea bid bundle purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_BUNDLE_PURCHASE); 
    })

    test('create opensea bid bundle sale', () => {
        global.walletAddress = "0x43a33125418b0de5bda8e4f30277e3cd31dc8a80".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_BUNDLE_SALE); 
    })
});