-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "company" TEXT,
ADD COLUMN     "items" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "tip" DOUBLE PRECISION,
ADD COLUMN     "total" DOUBLE PRECISION;
