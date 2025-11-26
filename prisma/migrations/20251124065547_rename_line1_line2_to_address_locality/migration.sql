/*
  Warnings:

  - You are about to drop the column `line1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line2` on the `Address` table. All the data in the column will be lost.
  - Added the required column `address` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "line1",
DROP COLUMN "line2",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "locality" TEXT;
