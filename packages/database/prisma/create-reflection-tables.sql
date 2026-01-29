-- Create ReflectionPoint and StudentReflectionMemory tables if missing.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query) if
-- you get: The table `public.ReflectionPoint` does not exist.

-- ReflectionPoint: reflection points within a chapter video
CREATE TABLE IF NOT EXISTS "ReflectionPoint" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "time" DOUBLE PRECISION NOT NULL,
  "topic" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ReflectionPoint_chapterId_idx" ON "ReflectionPoint"("chapterId");

-- StudentReflectionMemory: per-user reflection stats (optional; create if you use reflection memory)
CREATE TABLE IF NOT EXISTS "StudentReflectionMemory" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "weakTopics" TEXT[] DEFAULT '{}',
  "accuracyRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "totalAttempts" INTEGER NOT NULL DEFAULT 0,
  "correctAttempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
