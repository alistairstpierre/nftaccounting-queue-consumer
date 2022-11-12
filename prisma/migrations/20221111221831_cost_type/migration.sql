/*
  Warnings:

  - You are about to alter the column `cost` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Real`.
  - You are about to alter the column `type` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "cost" SET DATA TYPE REAL,
ALTER COLUMN "type" SET DATA TYPE VARCHAR(100);
