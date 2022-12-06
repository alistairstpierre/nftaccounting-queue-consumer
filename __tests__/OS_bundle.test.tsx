import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bundle from './json/opensea/bundle.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bundle

    test('is opensea transaction', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea bundle sale', () => {
        global.walletAddress = "0x082d57902773e786247b93a4027f7c5fe0404a9b".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUNDLE_SALE); 
    })

    test('create opensea bundle purchase', () => {
        global.walletAddress = "0x7d2859aa025bf997cd0b026db111f8677445bbbe".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.length).toEqual(2);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUNDLE_PURCHASE); 
    })
});