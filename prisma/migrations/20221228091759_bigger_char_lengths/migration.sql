/*
  Warnings:

  - The primary key for the `ERC721Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ERC721Trade" DROP CONSTRAINT "ERC721Trade_pkey",
ALTER COLUMN "purchaseUUID" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "saleUUID" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "purchaseTransaction" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "SaleTransaction" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "imgUrl" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "tokenId" SET DATA TYPE VARCHAR(512),
ALTER COLUMN "projectName" SET DATA TYPE VARCHAR(512),
ADD CONSTRAINT "ERC721Trade_pkey" PRIMARY KEY ("purchaseUUID");
