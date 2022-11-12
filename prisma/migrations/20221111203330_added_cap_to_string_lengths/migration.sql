/*
  Warnings:

  - The primary key for the `ERC721Trade` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `purchaseUUID` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `walletAddress` on the `ERC721Trade` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `walletAddress` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `Note` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `uuid` on the `Note` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `walletAddress` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- DropForeignKey
ALTER TABLE "ERC721Trade" DROP CONSTRAINT "ERC721Trade_walletAddress_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_walletAddress_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_uuid_fkey";

-- AlterTable
ALTER TABLE "ERC721Trade" DROP CONSTRAINT "ERC721Trade_pkey",
ALTER COLUMN "purchaseUUID" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "walletAddress" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "ERC721Trade_pkey" PRIMARY KEY ("purchaseUUID");

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "walletAddress" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Note" DROP CONSTRAINT "Note_pkey",
ALTER COLUMN "uuid" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "Note_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "walletAddress" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("walletAddress");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ERC721Trade" ADD CONSTRAINT "ERC721Trade_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "ERC721Trade"("purchaseUUID") ON DELETE RESTRICT ON UPDATE CASCADE;
