/*
  Warnings:

  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_uuid_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_walletAddress_fkey";

-- DropTable
DROP TABLE "Trade";

-- CreateTable
CREATE TABLE "ERC721Trade" (
    "id" SERIAL NOT NULL,
    "purchaseUUID" TEXT NOT NULL,
    "saleUUID" TEXT,
    "walletAddress" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purchaseType" VARCHAR(100) NOT NULL,
    "purchaseTransaction" VARCHAR(100) NOT NULL,
    "saleType" VARCHAR(100),
    "SaleTransaction" VARCHAR(100),
    "imgUrl" VARCHAR(255) NOT NULL,
    "tokenId" VARCHAR(100) NOT NULL,
    "contract" VARCHAR(100) NOT NULL,
    "projectAddress" VARCHAR(100) NOT NULL,
    "projectName" VARCHAR(255) NOT NULL,
    "cost" REAL NOT NULL,
    "sale" REAL,
    "feeGas" REAL NOT NULL,
    "feeExchange" REAL NOT NULL,
    "feeRoyalty" REAL,
    "profit" REAL NOT NULL,

    CONSTRAINT "ERC721Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ERC721Trade_purchaseUUID_key" ON "ERC721Trade"("purchaseUUID");

-- CreateIndex
CREATE UNIQUE INDEX "ERC721Trade_saleUUID_key" ON "ERC721Trade"("saleUUID");

-- AddForeignKey
ALTER TABLE "ERC721Trade" ADD CONSTRAINT "ERC721Trade_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "ERC721Trade"("purchaseUUID") ON DELETE RESTRICT ON UPDATE CASCADE;
