/*
  Warnings:

  - Made the column `sale` on table `Trade` required. This step will fail if there are existing NULL values in that column.
  - Made the column `feeRoyalty` on table `Trade` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Trade" ALTER COLUMN "cost" SET DATA TYPE REAL,
ALTER COLUMN "sale" SET NOT NULL,
ALTER COLUMN "sale" SET DATA TYPE REAL,
ALTER COLUMN "profit" SET DATA TYPE REAL,
ALTER COLUMN "feeExchange" SET DATA TYPE REAL,
ALTER COLUMN "feeGas" SET DATA TYPE REAL,
ALTER COLUMN "feeRoyalty" SET NOT NULL,
ALTER COLUMN "feeRoyalty" SET DATA TYPE REAL;
