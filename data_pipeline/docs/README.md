# Data Pipeline

Coffee reviews scraping and data processing pipeline for BrewIntelligence.

## Folder Structure
```
data_pipeline/
├── scripts/           # Python scripts
│   ├── scrape_and_embed.py    # Main scraper with embeddings
│   ├── fetch_sitemap.py       # URL discovery from sitemap
│   ├── migrate.py             # Basic migration
│   └── migrate_clean.py       # Data cleaning migration
├── sql/               # Database schemas
│   ├── supabase_schema.sql    # Main table schema
│   ├── add_normalized_columns.sql  # Cleaned data columns
│   └── match_reviews.sql      # Semantic search function
├── logs/              # Generated data & logs
├── docs/              # Documentation
└── requirements.txt   # Python dependencies
```

## Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install
```

## Usage

### Run the scraper
```bash
python scripts/scrape_and_embed.py
```

### Run data cleaning migration
```bash
python scripts/migrate_clean.py
```

## Environment Variables
Create `.env` in project root:
```
SUPABASE_URL="your-project-url"
SUPABASE_KEY="your-service-role-key"
```
