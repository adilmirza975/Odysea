-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "SavedDestination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "bestSeason" TEXT,
    "estimatedBudget" DOUBLE PRECISION,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavedDestination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedDestination" ADD CONSTRAINT "SavedDestination_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
