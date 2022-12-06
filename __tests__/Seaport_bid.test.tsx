import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bid from './json/opensea/seaport/bid.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bid

    test('is seaport bid', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create seaport bid purchase', () => {
        global.walletAddress = "0xed94f92bb02a60cecea0d434c805a5000bbaa37d".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_PURCHASE); 
    })

    test('create seaport bid sale', () => {
        global.walletAddress = "0x5ce878d898278a80208241b05953a6d83cb88916".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_SALE); 
    })
})