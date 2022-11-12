/*
  Warnings:

  - You are about to alter the column `saleUUID` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "ERC721Trade" ALTER COLUMN "saleUUID" SET DATA TYPE VARCHAR(255);
