-- Data Cleaning Migration: Add normalized columns
-- Run this in Supabase SQL Editor

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS price_numeric decimal(10,2);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS weight_oz decimal(10,2);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS weight_unit text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS price_per_oz_usd decimal(10,2);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_year int;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS roast_category text;

-- Create indexes for common filters
CREATE INDEX IF NOT EXISTS idx_reviews_country ON reviews(country);
CREATE INDEX IF NOT EXISTS idx_reviews_review_year ON reviews(review_year);
CREATE INDEX IF NOT EXISTS idx_reviews_roast_category ON reviews(roast_category);
