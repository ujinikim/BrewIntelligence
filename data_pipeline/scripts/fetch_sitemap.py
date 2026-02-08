import requests
import xml.etree.ElementTree as ET
import time
import os
import re

SITEMAP_INDEX = "https://www.coffeereview.com/sitemap_index.xml"

def get_xml_root(url):
    print(f"Fetching {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (compatible; BrewIntelligence/1.0)'}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    # Handle namespaces in XML if necessary, but simple parsing usually works
    return ET.fromstring(response.content)

def main():
    try:
        root = get_xml_root(SITEMAP_INDEX)
        
        # 1. Find the review sitemap(s)
        # Use Regex to avoid matching the domain name "coffeereview.com"
        review_sitemaps = []
        # Matches: /review-sitemap.xml, /review-sitemap2.xml, /post-sitemap.xml
        pattern = re.compile(r'/(review|post)-sitemap\d*\.xml$')

        for child in root:
            # Look for children that contain 'loc'
            loc = child.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
            if loc is not None and loc.text:
                if pattern.search(loc.text):
                    review_sitemaps.append(loc.text)
        
        print(f"Found {len(review_sitemaps)} potential review sitemaps: {review_sitemaps}")

        review_urls = []

        # 2. Iterate through review sitemaps to get actual URLs
        for sm_url in review_sitemaps:
            time.sleep(1) # Be polite
            sm_root = get_xml_root(sm_url)
            for child in sm_root:
                loc = child.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
                if loc is not None:
                    url = loc.text
                    # check for /review/ but EXCLUDE the main index page
                    if '/review/' in url and url != 'https://www.coffeereview.com/review/':
                        review_urls.append(url)

        print(f"Total Review URLs found: {len(review_urls)}")

        # 3. Save to file
        output_path = os.path.join('data_pipeline', 'urls.txt')
        with open(output_path, 'w') as f:
            for url in review_urls:
                f.write(url + '\n')
        
        print(f"Saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
