/*
  Warnings:

  - Made the column `timezone` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "timezone" SET NOT NULL;
