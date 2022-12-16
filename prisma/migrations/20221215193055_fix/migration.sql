-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('NONE', 'SUCCESS', 'PENDING', 'FAILURE');

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "cost" REAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "walletAddress" VARCHAR(100) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ERC721Trade" (
    "purchaseUUID" VARCHAR(255) NOT NULL,
    "saleUUID" VARCHAR(255),
    "walletAddress" VARCHAR(100) NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "saleDate" TIMESTAMP(3),
    "purchaseBlock" INTEGER NOT NULL,
    "saleBlock" INTEGER,
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

    CONSTRAINT "ERC721Trade_pkey" PRIMARY KEY ("purchaseUUID")
);

-- CreateTable
CREATE TABLE "Note" (
    "uuid" VARCHAR(255) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "contents" VARCHAR(2000) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "User" (
    "walletAddress" VARCHAR(100) NOT NULL,
    "tradesUpdatedAt" TIMESTAMP(3),
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'NONE',
    "hiddenCollections" TEXT[],
    "secondaryWallets" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("walletAddress")
);

-- CreateIndex
CREATE UNIQUE INDEX "ERC721Trade_purchaseUUID_key" ON "ERC721Trade"("purchaseUUID");

-- CreateIndex
CREATE UNIQUE INDEX "ERC721Trade_saleUUID_key" ON "ERC721Trade"("saleUUID");

-- CreateIndex
CREATE UNIQUE INDEX "Note_uuid_key" ON "Note"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ERC721Trade" ADD CONSTRAINT "ERC721Trade_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
