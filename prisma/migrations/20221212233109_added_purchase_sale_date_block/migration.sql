/*
  Warnings:

  - You are about to drop the column `date` on the `ERC721Trade` table. All the data in the column will be lost.
  - Added the required column `purchaseBlock` to the `ERC721Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `ERC721Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockNumber` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ERC721Trade" DROP COLUMN "date",
ADD COLUMN     "purchaseBlock" INTEGER NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "saleBlock" INTEGER,
ADD COLUMN     "saleDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "blockNumber" INTEGER NOT NULL;
