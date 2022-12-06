import { get_marketplace } from '../util/helpers'
import '@testing-library/jest-dom'
import { exchange } from '../util/nft-constants';

describe('helpers tests', () => {
    test('test 1', () => {
        expect(get_marketplace('1234124')).toEqual(undefined); 
    })
    test('test 2', () => {
        expect(get_marketplace('0xf24629fbb477e10f2cf331c2b7452d8596b5c7a5')).toEqual(exchange.GEM.toLowerCase());   
    })
})