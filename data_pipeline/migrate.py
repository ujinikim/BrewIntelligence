#!/usr/bin/env python3
"""
Migration script to add new columns to the reviews table.
Run once to update your Supabase schema.
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL statements to run
migrations = [
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS bottom_line text;",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS with_milk text;",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS slug text;",
]

print("🔄 Running migrations...")
for sql in migrations:
    try:
        # Use the RPC method to execute raw SQL
        result = supabase.rpc('exec_sql', {'sql': sql}).execute()
        print(f"  ✅ {sql[:60]}...")
    except Exception as e:
        # If RPC fails, try using postgrest's built-in method
        print(f"  ⚠️  Note: {sql[:40]}... (may need manual run)")
        print(f"      Error: {e}")

print("\n📝 If the above shows errors, please run this SQL manually in Supabase SQL Editor:")
print("-" * 60)
for sql in migrations:
    print(sql)
print("-" * 60)
print("\n✨ Done! Re-run the scraper after migration.")
