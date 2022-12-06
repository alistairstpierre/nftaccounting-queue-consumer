import "@testing-library/jest-dom";
import { CovalentItem } from "../interfaces"
import multi_hobo from "./json/Genie/multi_hobo.json";
import { create_genie_transaction, is_genie_transaction } from "../util/parsing/covalent/transaction-types/genie/genie_transaction";

describe("genie tests", () => {
  const item: CovalentItem = multi_hobo;

  test("is genie", () => {
    expect(is_genie_transaction(item)).toEqual(true);
  });

//   test("create genie purchase", () => {
//     store.setWalletAddress("0xea8a4ce7314deea8b66bc0760b11f0a534e22a58");
//     const obj = create_genie_transaction(item);
//     obj.forEach((element) => {
//       console.log(JSON.stringify(element))
//     });
//   });

  test("create genie sale", () => {
    global.walletAddress = "0x1347f0021ba56e1d9d8a761e3ddc541cc4c9d0d8".toLowerCase();
    const obj = create_genie_transaction(item);
    obj.forEach((element) => {
      console.log(JSON.stringify(element));
    });
  });
});
