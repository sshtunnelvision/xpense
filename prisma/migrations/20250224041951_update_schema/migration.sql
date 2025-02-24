/*
  Warnings:

  - You are about to drop the column `aiCategory` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `aiReasoning` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `extractedData` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Receipt` table. All the data in the column will be lost.
  - You are about to drop the column `dateRange` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `groupBy` on the `Report` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "aiCategory",
DROP COLUMN "aiReasoning",
DROP COLUMN "extractedData",
DROP COLUMN "status",
ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "dateRange",
DROP COLUMN "fileUrl",
DROP COLUMN "groupBy",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
