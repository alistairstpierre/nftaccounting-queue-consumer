/*
  Warnings:

  - The primary key for the `ERC721Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `purchaseUUID` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(255)`.
  - You are about to alter the column `saleUUID` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(255)`.
  - You are about to alter the column `purchaseTransaction` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(100)`.
  - You are about to alter the column `SaleTransaction` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(100)`.
  - You are about to alter the column `imgUrl` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(510)`.
  - You are about to alter the column `tokenId` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(255)`.
  - You are about to alter the column `projectName` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `VarChar(512)` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "ERC721Trade" DROP CONSTRAINT "ERC721Trade_pkey",
ALTER COLUMN "purchaseUUID" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "saleUUID" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "purchaseTransaction" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "SaleTransaction" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "imgUrl" SET DATA TYPE VARCHAR(510),
ALTER COLUMN "tokenId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "projectName" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "ERC721Trade_pkey" PRIMARY KEY ("purchaseUUID");
