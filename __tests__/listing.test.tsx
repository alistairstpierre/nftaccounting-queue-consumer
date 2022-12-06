import '@testing-library/jest-dom';
import { CovalentItem } from '../interfaces';
import listingJson from './json/listing.json'
import { tx_type } from '../util/nft-constants';
import { create_listing_transaction, is_listing_transaction } from '../util/parsing/covalent/transaction-types/listing';

describe('listing tests', () => {
    const item:CovalentItem = listingJson

    test('is listing', () => {
        expect(is_listing_transaction(item)).toEqual(true); 
    })

    test('create listings tx', () => {
        const listing = create_listing_transaction(item)
        console.log(JSON.stringify(listing));
        expect(listing.type).toEqual(tx_type.LISTING);
        expect(listing.date).toEqual(item.block_signed_at);
        expect(listing.tx_hash).toEqual(item.tx_hash);
    })
})