CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "universal_part_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "universal_part_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "universal_parts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "universal_parts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "admin_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "universal_part_groups" ADD COLUMN IF NOT EXISTS "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "universal_part_groups" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL;
ALTER TABLE "universal_part_groups" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "group_id" UUID NOT NULL;
ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL;
ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "universal_parts" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL;
ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "message" TEXT NOT NULL;
ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "resolved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "admin_notifications" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'universal_parts_group_id_fkey'
  ) THEN
    ALTER TABLE "universal_parts"
    ADD CONSTRAINT "universal_parts_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "universal_part_groups"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "universal_part_groups_name_key" ON "universal_part_groups"("name");
CREATE INDEX IF NOT EXISTS "universal_part_groups_created_at_idx" ON "universal_part_groups"("created_at");
CREATE INDEX IF NOT EXISTS "universal_parts_group_id_idx" ON "universal_parts"("group_id");
CREATE INDEX IF NOT EXISTS "universal_parts_created_at_idx" ON "universal_parts"("created_at");
CREATE INDEX IF NOT EXISTS "universal_parts_approved_idx" ON "universal_parts"("approved");
CREATE UNIQUE INDEX IF NOT EXISTS "universal_parts_group_id_name_key" ON "universal_parts"("group_id", "name");
CREATE INDEX IF NOT EXISTS "admin_notifications_resolved_idx" ON "admin_notifications"("resolved");
CREATE INDEX IF NOT EXISTS "admin_notifications_created_at_idx" ON "admin_notifications"("created_at");

ALTER TABLE "universal_part_groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "universal_parts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_notifications" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'universal_part_groups'
      AND policyname = 'universal_part_groups_admin_all'
  ) THEN
    CREATE POLICY "universal_part_groups_admin_all"
    ON "universal_part_groups"
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'universal_part_groups'
      AND policyname = 'universal_part_groups_approved_read'
  ) THEN
    CREATE POLICY "universal_part_groups_approved_read"
    ON "universal_part_groups"
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "universal_parts"
        WHERE "universal_parts"."group_id" = "universal_part_groups"."id"
          AND "universal_parts"."approved" = true
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'universal_parts'
      AND policyname = 'universal_parts_admin_all'
  ) THEN
    CREATE POLICY "universal_parts_admin_all"
    ON "universal_parts"
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'universal_parts'
      AND policyname = 'universal_parts_approved_read'
  ) THEN
    CREATE POLICY "universal_parts_approved_read"
    ON "universal_parts"
    FOR SELECT
    TO authenticated
    USING ("approved" = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_notifications'
      AND policyname = 'admin_notifications_admin_all'
  ) THEN
    CREATE POLICY "admin_notifications_admin_all"
    ON "admin_notifications"
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE "User"."email" = auth.jwt() ->> 'email'
          AND "User"."role" = 'ADMIN'
      )
    );
  END IF;
END $$;
