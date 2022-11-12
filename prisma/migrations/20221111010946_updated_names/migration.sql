/*
  Warnings:

  - You are about to drop the column `fee_exchange` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `fee_gas` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `fee_royalty` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `feeExchange` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeGas` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "fee_exchange",
DROP COLUMN "fee_gas",
DROP COLUMN "fee_royalty",
ADD COLUMN     "feeExchange" BIGINT NOT NULL,
ADD COLUMN     "feeGas" BIGINT NOT NULL,
ADD COLUMN     "feeRoyalty" BIGINT,
ALTER COLUMN "saleType" DROP NOT NULL,
ALTER COLUMN "SaleTransaction" DROP NOT NULL,
ALTER COLUMN "sale" DROP NOT NULL;
