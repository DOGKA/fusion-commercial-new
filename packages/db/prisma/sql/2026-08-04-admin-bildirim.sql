-- Persistent admin notifications.
-- Hand-written deployment SQL: review and apply through the normal production
-- change process. This file is intentionally not a Prisma migration.

CREATE TABLE IF NOT EXISTS "admin_notifications" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subTitle" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "sourceId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_notifications_dedupeKey_key"
  ON "admin_notifications"("dedupeKey");
CREATE INDEX IF NOT EXISTS "admin_notifications_active_createdAt_idx"
  ON "admin_notifications"("active", "createdAt");
CREATE INDEX IF NOT EXISTS "admin_notifications_type_sourceId_idx"
  ON "admin_notifications"("type", "sourceId");

CREATE TABLE IF NOT EXISTS "admin_notification_states" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "remindAt" TIMESTAMP(3),
  "presentedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_notification_states_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_notification_states_notificationId_fkey"
    FOREIGN KEY ("notificationId") REFERENCES "admin_notifications"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "admin_notification_states_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_notification_states_notificationId_userId_key"
  ON "admin_notification_states"("notificationId", "userId");
CREATE INDEX IF NOT EXISTS "admin_notification_states_userId_dismissedAt_remindAt_idx"
  ON "admin_notification_states"("userId", "dismissedAt", "remindAt");

-- `admin_dismissed_notifications` is intentionally retained. The application
-- reads it while old notification ids are transitioned to durable state.
