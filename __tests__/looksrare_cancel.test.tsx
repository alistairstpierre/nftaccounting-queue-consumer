
import { CovalentItem } from '../interfaces';
import buynoweth from './json/looksrare/cancelmultipleorders.json'
import { tx_type } from '../util/nft-constants';
import { create_looksrare_transaction, is_looksrare_transaction } from '../util/parsing/covalent/transaction-types/looksrare/lr_transaction';
import { create_looksrare_cancel_multiple_transaction } from '../util/parsing/covalent/transaction-types/looksrare/lr_cancel_multiple';

describe('looksrare cancel test', () => {
    const item:CovalentItem = buynoweth

    test('is looksrare', () => {
        expect(is_looksrare_transaction(item)).toEqual(true); 
    })

    test('create looksrare cancel', () => {
        const obj = create_looksrare_cancel_multiple_transaction(item)
        console.log(JSON.stringify(obj))

        expect(obj.type).toEqual(tx_type.CANCELLED); 
    })
})