-- Phase 1: Normalized tables for data pipeline
-- Run this in Supabase SQL Editor

-- Pre-aggregated roaster statistics
CREATE TABLE IF NOT EXISTS roasters (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  location text,
  review_count int DEFAULT 0,
  avg_rating decimal(4,1),
  top_score int,
  avg_price_per_oz decimal(10,2),
  updated_at timestamptz DEFAULT now()
);

-- Pre-aggregated country statistics
CREATE TABLE IF NOT EXISTS countries (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text UNIQUE NOT NULL,
  review_count int DEFAULT 0,
  avg_rating decimal(4,1),
  avg_price_per_oz decimal(10,2),
  top_score int,
  dominant_roast text,
  updated_at timestamptz DEFAULT now()
);

-- Key-value store for pre-computed insight aggregations
CREATE TABLE IF NOT EXISTS insights_cache (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  computed_at timestamptz DEFAULT now()
);