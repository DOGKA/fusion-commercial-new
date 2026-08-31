CREATE TABLE "homepage_video_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_video_categories_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "homepage_videos" ADD COLUMN "categoryId" TEXT;

CREATE INDEX "homepage_videos_categoryId_idx" ON "homepage_videos"("categoryId");

ALTER TABLE "homepage_videos"
ADD CONSTRAINT "homepage_videos_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "homepage_video_categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
