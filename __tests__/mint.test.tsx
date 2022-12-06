import { is_mint_transaction, create_mint_transaction } from "../util/parsing/covalent/transaction-types/mint";
import "@testing-library/jest-dom";
import { CovalentItem } from "../interfaces";
import mintJson from "./json/mint.json";
import { tx_type } from "../util/nft-constants";

describe("mint tests", () => {
  const item: CovalentItem = mintJson;

  test("is mint", () => {
    global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
    expect(is_mint_transaction(item)).toEqual(true);
  });

  test('create mint tx', () => {
      const mints = create_mint_transaction(item)
      expect(mints.length).toEqual(5)
      console.log(mints)

      mints.forEach(element => {
          expect(element.type).toEqual(tx_type.MINT);
          expect(element.date).toEqual(item.block_signed_at);
          expect(element.tx_hash).toEqual(item.tx_hash);
      });

  })

  // const item2: CovalentItem = mintTransfer;

  // test("create mint tx", () => {
  //   store.setWalletAddress("0x73cd457e12f5fa160261fef96c63ca4ca0478b2f");
  //   const mints = create_mint_transaction(item2);
  //   mints.forEach(element => {
  //       console.log(JSON.stringify(element))
  //   });
  // });
});
