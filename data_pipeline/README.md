# Data Pipeline Setup

## 1. Environment Setup
1.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    playwright install
    ```

## 2. Supabase Setup
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  Go to the **SQL Editor** in the sidebase.
3.  Copy the contents of `supabase_schema.sql` and run it. This will:
    *   Enable `pgvector`.
    *   Create the `reviews` table.
    *   Create the `match_reviews` function.
4.  Get your **Project URL** and **Service Role Key** (Project Settings > API).

## 3. Configuration
Create a `.env` file in this directory:
```bash
SUPABASE_URL="your-project-url"
SUPABASE_KEY="your-service-role-key"  # Service role needed for writing data
```

## 4. Running the Scraper
(Scripts coming soon: `fetch_sitemap.py` and `scrape_and_embed.py`)
