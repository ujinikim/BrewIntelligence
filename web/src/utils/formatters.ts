export function cleanDescription(text?: string): string {
  if (!text) return '';
  
  // Remove metadata prefixes often found in the text
  let cleaned = text.replace(/^\d{2}[^.]*?(Roaster Location:|Review Date:|Aroma:)/i, '$1');
  
  // Remove common labels and newlines
  cleaned = cleaned.replace(/^(Roaster Location:|Roast Level:|Agtron:|Review Date:|Aroma:|Acidity:|Body:|Flavor:|Blind Assessment|Notes|Who Should Drink It).*?\n/gi, '');
  cleaned = cleaned.replace(/^(Roaster Location:|Roast Level:|Agtron:|Review Date:|Aroma:|Acidity:|Body:|Flavor:|Blind Assessment|Notes|Who Should Drink It)/gi, '');
  
  if (cleaned.includes('No review notes available')) return '';
  
  return cleaned.trim() || text.trim();
}
