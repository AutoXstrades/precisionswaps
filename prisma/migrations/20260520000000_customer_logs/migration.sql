CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "customer_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "build_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "customer_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_logs_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "Build"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customer_logs_sender_role_check" CHECK ("sender_role" IN ('admin', 'customer'))
);

CREATE INDEX "customer_logs_build_id_idx" ON "customer_logs"("build_id");
CREATE INDEX "customer_logs_timestamp_idx" ON "customer_logs"("timestamp");

ALTER TABLE "customer_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_logs_customer_own_build_read_write"
ON "customer_logs"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Build"
    JOIN "User" ON "User"."id" = "Build"."userId"
    WHERE "Build"."id" = "customer_logs"."build_id"
      AND "User"."email" = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Build"
    JOIN "User" ON "User"."id" = "Build"."userId"
    WHERE "Build"."id" = "customer_logs"."build_id"
      AND "User"."email" = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "customer_logs_admin_all_read_write"
ON "customer_logs"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "User"
    WHERE "User"."email" = auth.jwt() ->> 'email'
      AND "User"."role" = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "User"
    WHERE "User"."email" = auth.jwt() ->> 'email'
      AND "User"."role" = 'ADMIN'
  )
);
