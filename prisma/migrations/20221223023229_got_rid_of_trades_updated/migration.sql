/*
  Warnings:

  - You are about to drop the column `tradesUpdatedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tradesUpdatedAt",
ADD COLUMN     "hiddenWallets" TEXT[];
