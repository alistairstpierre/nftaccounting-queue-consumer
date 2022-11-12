-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "purchaseType" VARCHAR(100) NOT NULL,
    "purchaseTransaction" VARCHAR(100) NOT NULL,
    "saleType" VARCHAR(100) NOT NULL,
    "SaleTransaction" VARCHAR(100) NOT NULL,
    "imgUrl" VARCHAR(255) NOT NULL,
    "tokenId" VARCHAR(100) NOT NULL,
    "contract" VARCHAR(100) NOT NULL,
    "projectAddress" VARCHAR(100) NOT NULL,
    "projectName" VARCHAR(255) NOT NULL,
    "cost" BIGINT NOT NULL,
    "sale" BIGINT NOT NULL,
    "fee_gas" BIGINT NOT NULL,
    "fee_exchange" BIGINT NOT NULL,
    "fee_royalty" BIGINT NOT NULL,
    "profit" BIGINT NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_walletAddress_key" ON "Trade"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_walletAddress_key" ON "Settings"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
