/*
  Warnings:

  - A unique constraint covering the columns `[roomId,bedNo]` on the table `Bed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notificationId,userId]` on the table `NotificationRecipient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NotificationRecipient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Bed_roomId_bedNo_key" ON "Bed"("roomId", "bedNo");

-- CreateIndex
CREATE INDEX "NotificationRecipient_userId_idx" ON "NotificationRecipient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_userId_key" ON "NotificationRecipient"("notificationId", "userId");
