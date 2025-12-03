-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
