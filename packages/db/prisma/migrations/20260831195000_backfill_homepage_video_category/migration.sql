INSERT INTO "homepage_video_categories" (
    "id",
    "name",
    "order",
    "createdAt",
    "updatedAt"
)
SELECT
    'homepage-video-category-sizden-gelenler',
    'Sizden Gelenler',
    COALESCE(MAX("order") + 1, 0),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "homepage_video_categories"
WHERE NOT EXISTS (
    SELECT 1
    FROM "homepage_video_categories"
    WHERE "name" = 'Sizden Gelenler'
);

UPDATE "homepage_videos"
SET "categoryId" = (
    SELECT "id"
    FROM "homepage_video_categories"
    WHERE "name" = 'Sizden Gelenler'
    ORDER BY "createdAt" ASC
    LIMIT 1
)
WHERE "categoryId" IS NULL;
