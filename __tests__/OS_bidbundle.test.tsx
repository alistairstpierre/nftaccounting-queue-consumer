import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bidbundle from './json/opensea/bidbundle.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bidbundle


    test('is opensea transaction', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea bid bundle sale', () => {
        global.walletAddress = "0x79176a6095f2b4fa5d5be25124df2e804775e675".toLowerCase();
        const obj = create_opensea_transaction(item)
        //console.log(JSON.stringify(obj))
        // for(let i = 0; i < obj.length; i++) {
        //     console.log(`${i}: ${JSON.stringify(obj[i])}`)
        // }

        expect(obj.length).toEqual(15);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_BUNDLE_SALE); 
    })

    test('create opensea bid bundle purchase', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_opensea_transaction(item)
        //console.log(JSON.stringify(obj))
        // for(let i = 0; i < obj.length; i++) {
        //     console.log(`${i}: ${JSON.stringify(obj[i])}`)
        // }

        expect(obj.length).toEqual(15);
        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_BUNDLE_PURCHASE); 
    })
});