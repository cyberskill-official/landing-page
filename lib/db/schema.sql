-- CyberSkill lead and transcript schema v1
-- Deploy with: psql $DATABASE_URL < lib/db/schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  source TEXT NOT NULL DEFAULT 'unknown',
  intent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retention_date TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transcripts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  lead_id TEXT REFERENCES leads(id),
  messages JSONB NOT NULL DEFAULT '[]',
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  retention_date TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);
