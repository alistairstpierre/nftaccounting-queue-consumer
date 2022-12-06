import "@testing-library/jest-dom";
import { CovalentItem } from "../interfaces";
import gem from "./json/Gem/1.json";
import multi_bulls1 from "./json/Gem/multi_bulls1.json";
import multi_bulls2 from "./json/Gem/multi_bulls2.json";
import multi from "./json/Gem/multi.json";
import gem_broken from "./json/Gem/gem_broken.json";
import seaport from "./json/Gem/seaport.json";
import { create_gem_transaction, is_gem_transaction } from "../util/parsing/covalent/transaction-types/gem/gem_transaction";
import { exchange, tx_type } from "../util/nft-constants";

describe("gem tests", () => {
  const item: CovalentItem = gem_broken;

  test("is gem", () => {
    expect(is_gem_transaction(item)).toEqual(true);
  });

    test("create gem purchase", () => {
      global.walletAddress = "0x73cd457e12f5fa160261fef96c63ca4ca0478b2f".toLowerCase();
      const obj = create_gem_transaction(item);
      obj.forEach((element) => {
        console.log(JSON.stringify(element))
      });
    });

  //   test("create gem sale", () => {
  //     store.setWalletAddress("0x43a33125418B0dE5Bda8E4f30277e3cD31dc8A80");
  //     const obj = create_gem_transaction(item);
  //     obj.forEach((element) => {
  //       expect(element.type).toEqual(tx_type.GEM_SALE);
  //       expect(element.exchange).toEqual(exchange.OPENSEA);
  //     });
  //   });

  // const item2: CovalentItem = multi_bulls1;

  // test("is gem", () => {
  //   expect(is_gem_transaction(item2)).toEqual(true);
  // });

  //   test('create gem purchase', () => {
  //       store.setWalletAddress('0xA7C4cb3f59021D2cbF6659005CCc09Be35C69731')
  //       const obj = create_gem_transaction(item2)
  //       obj.forEach(element => {
  //           console.log(JSON.stringify(element))
  //       });
  //   })

  //   test("create gem sale", () => {
  //     store.setWalletAddress("0x848fba2129cd31844cb22dd7d0e69478bfb96f7c");
  //     const obj = create_gem_transaction(item2);
  //     obj.forEach((element) => {
  //       expect(element.exchange).toEqual(exchange.OPENSEA);
  //     });
  //   });

  //   test("create gem sale", () => {
  //     store.setWalletAddress("0x137331ed7e7c9ffffb24f738c6d0fb52bedd97f9");
  //     const obj = create_gem_transaction(item2);
  //     obj.forEach((element) => {
  //         expect(element.exchange).toEqual(exchange.LOOKSRARE);
  //     });
  //   });

  // const item3: CovalentItem = multi_bulls2;

  // test("is gem", () => {
  //   expect(is_gem_transaction(item3)).toEqual(true);
  // });

  //   test("create gem purchase", () => {
  //     store.setWalletAddress("0xA7C4cb3f59021D2cbF6659005CCc09Be35C69731");
  //     const obj = create_gem_transaction(item3);
  //     obj.forEach((element) => {
  //       console.log(JSON.stringify(element));
  //     });
  //   });

  //   test("create gem sale", () => {
  //     store.setWalletAddress("0x51C31771aB7407977D230095B6ac3368869E27dB");
  //     const obj = create_gem_transaction(item3);
  //     obj.forEach((element) => {
  //         console.log(JSON.stringify(element));
  //       expect(element.exchange).toEqual(exchange.X2Y2);
  //     });
  //   });

  // const item4: CovalentItem = seaport;

  // test("is gem", () => {
  //   expect(is_gem_transaction(item4)).toEqual(true);
  // });

//   test("create gem purchase", () => {
//     store.setWalletAddress("0x5e877b575f43783124f92fc8693697e3bd0a9df9");
//     const obj = create_gem_transaction(item4);
//     obj.forEach((element) => {
//       console.log(JSON.stringify(element));
//     });
//   });

  // test("create gem sale", () => {
  //   store.setWalletAddress("0xed94f92bb02a60cecea0d434c805a5000bbaa37d");
  //   const obj = create_gem_transaction(item4);
  //   obj.forEach((element) => {
  //     console.log(JSON.stringify(element));
  //   });
  // });
});
