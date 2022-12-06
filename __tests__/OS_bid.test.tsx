import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import bid from './json/opensea/bid.json'
import { tx_type } from '../util/nft-constants';
import broken from './json/opensea/broken.json'
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('mint tests', () => {
    const item:CovalentItem = bid

    test('is opensea bid', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create opensea bid sale', () => {
        global.walletAddress = "0x051d0ab07fd1090641d98628df53f30a301f797f".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_SALE); 
    })

    test('create opensea bid purchase', () => {
        global.walletAddress = "0x53da1b4574922a1536acc012b3b8771317d1a430".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_PURCHASE); 
    })

    
    const item2:CovalentItem = broken

    test('is opensea buynow 2', () => {
        expect(is_opensea_transaction(item2)).toEqual(true); 
    })

    test('create opensea buynow purchase 2', () => {
        global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
        const obj = create_opensea_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_PURCHASE); 
    })

    test('create opensea buynow sale 2', () => {
        global.walletAddress = "0x632b7e8b6fd4fdb94f2ec38e3a55092f52a979fd".toLowerCase();
        const obj = create_opensea_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BID_SALE); 
    })
});