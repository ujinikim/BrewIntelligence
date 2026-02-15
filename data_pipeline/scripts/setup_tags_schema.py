import os
from supabase import create_client

# Manually load .env to avoid dependency issues
env_path = os.path.join(os.path.dirname(__file__), '../.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip("'").strip('"')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY not found in env.")
    # Fallback to web .env.local if not in data_pipeline
    web_env_path = os.path.join(os.path.dirname(__file__), '../../web/.env.local')
    if os.path.exists(web_env_path):
        print("  Trying web/.env.local...")
        with open(web_env_path, 'r') as f:
            for line in f:
                if 'SUPABASE_URL' in line or 'SUPABASE_KEY' in line:
                     key, value = line.strip().split('=', 1)
                     os.environ[key.strip()] = value.strip()
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Critical Error: Could not find Supabase credentials.")
    exit(1)

# Initialize Supabase client
# Note: if 'supabase' package is missing, this will fail. 
# But 'post_process.py' used it, so it should be there.
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
except ImportError:
    print("❌ Error: 'supabase' package not found. Run: pip install supabase")
    exit(1)

def run_migration():
    print("🔄 preparing to apply LLM tagging schema...")
    
    # Read the SQL file
    sql_path = os.path.join(os.path.dirname(__file__), '../sql/05_llm_tags.sql')
    try:
        with open(sql_path, 'r') as f:
            sql_content = f.read()
    except FileNotFoundError:
        print(f"❌ Error: Could not find SQL file at {sql_path}")
        return

    # Split into individual statements (naive split by ';')
    # This is a bit risky for complex SQL but works for simple schemas
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]

    print(f"found {len(statements)} SQL statements to execute.")

    # Try to execute via RPC (if exec_sql exists)
    try:
        print("\nAttempting to run via Supabase RPC...")
        for stmt in statements:
             # This assumes an 'exec_sql' function exists. 
             # If not, it will fail and we'll print instructions.
            supabase.rpc('exec_sql', {'sql': stmt}).execute()
            print("  ✅ Executed statement.")
        print("\n✨ Schema applied successfully!")
        
    except Exception as e:
        print("\n⚠️  Could not execute SQL directly via API.")
        print("   (This is normal if the 'exec_sql' helper function is not installed)")
        print("\n👉 Please copy/paste the following SQL into the Supabase Dashboard (SQL Editor):")
        print("=" * 60)
        print(sql_content)
        print("=" * 60)

if __name__ == "__main__":
    run_migration()
