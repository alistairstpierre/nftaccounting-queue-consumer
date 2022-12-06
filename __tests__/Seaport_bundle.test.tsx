import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bundle from './json/opensea/seaport/bundle.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bundle

    test('is opensea transaction', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea bundle sale', () => {
        global.walletAddress = "0xe6e6c5c258c7d5574ede8ace9a0e4ab6bbe28c49".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(5);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUNDLE_SALE); 
    })

    test('create opensea bundle purchase', () => {
        global.walletAddress = "0x43a33125418b0de5bda8e4f30277e3cd31dc8a80".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(5);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUNDLE_PURCHASE); 
    })
});