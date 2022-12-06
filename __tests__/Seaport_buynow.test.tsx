import '@testing-library/jest-dom'
import { CovalentItem } from '../interfaces';
import buynow from './json/opensea/seaport/buynow.json'
import broken from './json/opensea/seaport/broken.json'
import { tx_type } from '../util/nft-constants';
import { create_opensea_transaction, is_opensea_transaction } from '../util/parsing/covalent/transaction-types/opensea/os_transaction';

describe('seaport buynow tests', () => {
    const item:CovalentItem = buynow
    const item2:CovalentItem = broken

    test('is seaport buynow', () => {
        expect(is_opensea_transaction(item)).toEqual(true); 
    })

    test('create seaport buynow purchase', () => {
        global.walletAddress = "0xed94f92bb02a60cecea0d434c805a5000bbaa37d".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_PURCHASE); 
    })

    test('create seaport buynow sale', () => {
        global.walletAddress = "0xd49322add203c8e04acdd53b7ff14b5e0ac861d7".toLowerCase();
        const obj = create_opensea_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_SALE); 
    })

    test('is seaport buynow', () => {
        expect(is_opensea_transaction(item2)).toEqual(true); 
    })

    test('create seaport buynow purchase 2', () => {
        global.walletAddress = "0x8b5dfc2c530c656449f5ede146868bdbcdc675e3".toLowerCase();
        const obj = create_opensea_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_PURCHASE); 
    })

    test('create seaport buynow sale 2', () => {
        global.walletAddress = "0x0c9E8B7493ef07746524fd234bf6E47dc6a33634".toLowerCase();
        const obj = create_opensea_transaction(item2)
        console.log(JSON.stringify(obj))

        expect(obj[0]?.type).toEqual(tx_type.OPENSEA_BUYNOW_SALE); 
    })
})