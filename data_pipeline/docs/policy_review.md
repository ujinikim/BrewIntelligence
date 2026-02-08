# Scraping Policy: CoffeeReview.com

**Target**: `https://www.coffeereview.com`
**Status**: ✅ Permitted with Constraints

## 1. Rules (`robots.txt`)
*   **Allowed**: General browsing, Sitemap (`/sitemap_index.xml`).
*   **Disallowed**: Search queries (`/?s=*`), Admin areas (`/wp-admin/`), REST API (`/wp-json/`).
*   **Blocked**: Major AI bots (GPTBot, ClaudeBot, Google-Extended) and commercial scrapers (Semrush, Amazonbot).

## 2. Compliance Strategy
*   **Method**: Use the **Sitemap** to discover URLs. Do not crawl links recursively.
*   **Identity**: Use a standard browser User-Agent to avoid Cloudflare "AI Bot" triggers.
*   **Rate Limit**: Essential. Minimum **2-3 seconds** delay between requests.

## 3. Implementation Plan
*   **Stack**: Python (`requests` + `BeautifulSoup`).
*   **Flow**: Fetch Sitemap -> Extract Review URLs -> Fetch Pages (conditionally) -> Parse -> Save JSON.
