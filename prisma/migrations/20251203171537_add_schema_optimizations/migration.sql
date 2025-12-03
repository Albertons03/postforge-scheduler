/*
  Warnings:

  - You are about to alter the column `content` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.

*/
-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "content" SET DATA TYPE VARCHAR(500);

-- CreateIndex
CREATE INDEX "CreditTransaction_type_idx" ON "CreditTransaction"("type");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");
