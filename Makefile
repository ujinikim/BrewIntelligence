.PHONY: setup dev clean scrape

# Setup: Create venv and install all deps
setup:
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt
	cd web && npm install --legacy-peer-deps

# Run the Scraper
scrape:
	./venv/bin/python data_pipeline/scrape_and_embed.py

# Run the Analysis
analyze:
	./venv/bin/python analysis/analyze_data.py

# Start Next.js (Development)
dev:
	cd web && npm run dev

# Clean up
clean:
	rm -rf venv
	rm -rf web/node_modules
	rm -rf web/.next
