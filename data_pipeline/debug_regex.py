import re

# Load the raw content
with open('data_pipeline/raw_response_sample.txt', 'r') as f:
    content = f.read()

# The pattern we used
pattern = re.compile(
    r'(?P<rating>\d{2})\s*\n+\s*(?P<roaster>[^\n]+)\s*\n+\s*(?P<title>[^\n]+)', 
    re.MULTILINE
)

print("--- Searching for matches ---")
for match in pattern.finditer(content):
    print(f"Match Found: {match.group(0)!r}")
    print(f"  Rating: {match.group('rating')}")
    print(f"  Roaster: {match.group('roaster')}")
    print(f"  Title: {match.group('title')}")
    print(f"  > Context Before: {content[max(0, match.start()-50):match.start()]!r}")
    print(f"  > Context After:  {content[match.end():match.end()+50]!r}")
    print("-" * 30)
