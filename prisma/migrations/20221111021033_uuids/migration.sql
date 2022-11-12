/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Trade` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[purchaseUUID]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[saleUUID]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `purchaseUUID` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "updatedAt",
ADD COLUMN     "purchaseUUID" TEXT NOT NULL,
ADD COLUMN     "saleUUID" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tradesRefreshed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tradesUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "contents" VARCHAR(2000) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Note_uuid_key" ON "Note"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_purchaseUUID_key" ON "Trade"("purchaseUUID");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_saleUUID_key" ON "Trade"("saleUUID");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "Trade"("purchaseUUID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
