-- CreateTable
CREATE TABLE "feedback_images" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feedback_images" ADD CONSTRAINT "feedback_images_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "product_feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
