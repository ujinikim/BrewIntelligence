import re

file_path = 'data_pipeline/raw_response_sample.txt'

try:
    with open(file_path, 'r') as f:
        content = f.read()

    print(f"--- Content Start (First 500 chars) ---\n{content[:500]}\n--- Content End ---")

    # User's suggested regex (slightly adjusted for python string literals)
    # Testing User's Pattern concept but adapted for Python's re module specifics
    # Pattern: Ratings (2 digits) -> Newlines -> Roaster -> Newlines -> Title
    
    # Validating against:
    # 71
    # 
    # 
    # Yuban Coffee Company
    # 100% Colombian
    
    # We use verbose mode for readability and robust newline handling
    pattern = re.compile(
        r'(?P<rating>\d{2})\s*\n+\s*'        # 71 + newlines
        r'(?P<roaster>[^\n]+)\s*\n+\s*'      # Roaster Line
        r'(?P<blend>[^\n]+)',                # Title Line
        re.MULTILINE
    )

    matches = pattern.finditer(content)
    
    print("\n--- Matches ---")
    found = False
    for match in matches:
        found = True
        print(f"Full Match: {match.group(0)!r}")
        print(f"Rating: {match.group('rating')}")
        print(f"Roaster: {match.group('roaster')}")
        print(f"Blend: {match.group('blend')}")
        print("-" * 20)

    if not found:
        print("No matches found.")

except Exception as e:
    print(f"Error: {e}")
