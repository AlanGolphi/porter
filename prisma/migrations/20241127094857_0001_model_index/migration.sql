-- AlterTable
ALTER TABLE "UploadedFile" ALTER COLUMN "hash" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "UploadedFile_userId_idx" ON "UploadedFile"("userId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
