-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('LOCAL', 'S3');

-- CreateEnum
CREATE TYPE "MediaUsage" AS ENUM ('USER_PHOTO', 'BANNER', 'SLIDER', 'PRODUCT', 'CATEGORY', 'OTHER');

-- AlterTable
ALTER TABLE "media" DROP COLUMN "caption",
DROP COLUMN "folder",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "ownerUserId" TEXT,
ADD COLUMN     "provider" "MediaProvider" NOT NULL DEFAULT 'S3',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "usage" "MediaUsage" NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "alt" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarMediaId" TEXT,
ADD COLUMN     "avatarPath" TEXT;

-- DropEnum
DROP TYPE "MediaFolder";
