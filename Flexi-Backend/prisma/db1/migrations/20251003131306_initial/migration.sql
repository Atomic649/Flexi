/*
  Warnings:

  - Added the required column `updatedAt` to the `ChatSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatSession" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
