/*
  Warnings:

  - You are about to drop the column `tradesRefreshed` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('NONE', 'SUCCESS', 'PENDING', 'FAILURE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tradesRefreshed",
ADD COLUMN     "dataStatus" "DataStatus" NOT NULL DEFAULT 'NONE';
