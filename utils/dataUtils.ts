
import { BASIS_MARKERS } from '../constants';
import type { Basis } from '../types';

export const isValidContent = (content: string | null | undefined): content is string => {
  if (!content) return false;
  const trimmed = content.trim();
  const upper = trimmed.toUpperCase();
  
  // Reject common parsing artifacts or empty/N/A values
  if (
    trimmed === "" || 
    upper === "N/A" || 
    upper === "NA" || 
    upper === "NONE" || 
    upper.includes("(DATA TRUNCATED)") ||
    upper.includes("NO DATA AVAILABLE")
  ) {
    return false;
  }

  // Reject strings that are purely punctuation or brackets (e.g., ".", ".]", "[]", "-")
  if (/^[\s\.,;:\-\[\]\(\)]+$/.test(trimmed)) {
    return false;
  }
  
  return true;
};

const extractBasisContent = (fullText: string, selectedBasis: Basis): string | null => {
  if (!fullText || selectedBasis === 'All') {
    return null;
  }

  // Map all markers to their positions in the text
  const matches: { basis: string, index: number }[] = [];

  BASIS_MARKERS.forEach(markerConfig => {
    // Create a regex that matches any of the patterns for this basis
    // Matches start of string OR any non-alphanumeric character (space, bracket, dash, etc.) before the marker
    // This ensures we match " R:", "(R:", "-R:", "[R:" but not "foobar:"
    const patternString = markerConfig.patterns.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])(${patternString})`, 'gi');
    
    let match;
    while ((match = regex.exec(fullText)) !== null) {
      // match[0] is the full match (e.g. " R:")
      // match[1] is the capturing group (e.g. "R:")
      // We need the index where match[1] starts
      const fullMatchStr = match[0];
      const capturedMarker = match[1];
      const offset = fullMatchStr.lastIndexOf(capturedMarker);
      
      matches.push({
        basis: markerConfig.basis,
        index: match.index + offset
      });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);

  // Find the match for the selected basis
  const selectedMatch = matches.find(m => m.basis === selectedBasis);

  if (!selectedMatch) {
    return null;
  }

  // Find the start of the NEXT marker to define the end of this section
  const nextMatch = matches.find(m => m.index > selectedMatch.index);
  
  const endIndex = nextMatch ? nextMatch.index : fullText.length;

  // Extract content
  const extracted = fullText.substring(selectedMatch.index, endIndex).trim();

  return isValidContent(extracted) ? extracted : null;
};


export const formatData = (data: any, basis: Basis): string | null => {
  if (!data) return null;
  
  // Handle String Input (Concatenated Data) or already processed string
  if (typeof data === 'string') {
    // Explicit check to prevent "garbled text" bug if a string is passed where an object is expected elsewhere
    if (!isValidContent(data)) return null;

    if (basis === 'All') {
      return data;
    }
    // If a specific basis is requested, try to extract it from the string
    return extractBasisContent(data, basis);
  }

  // Fallback for non-object types that aren't strings (e.g. numbers)
  if (typeof data !== 'object') {
    const strVal = String(data);
    return isValidContent(strVal) ? strVal : null;
  }

  // Handle Object Input (Structured Data)
  if (basis !== 'All') {
    // 1. Try direct key access (if data is structured by basis)
    if (isValidContent(data[basis])) {
      return data[basis];
    }
    // 2. Fallback: Try to parse from 'All' or other keys if the data is mixed/concatenated inside an object value
    for (const content of Object.values(data)) {
      if (isValidContent(content as string)) {
        const extractedContent = extractBasisContent(content as string, basis);
        if (isValidContent(extractedContent)) {
          return extractedContent;
        }
      }
    }
    return null;
  }

  // For 'All' basis with Object Data
  const validKeys = Object.keys(data).filter(k => isValidContent(data[k]));
  
  // Optimization: If only 'All' key exists, return it directly
  if (data["All"] && validKeys.length === 1 && validKeys[0] === "All") {
    return data["All"];
  }

  if (validKeys.length === 0) return null;

  const content: string[] = [];
  validKeys.sort().forEach(key => {
    if (validKeys.length > 1 && key !== 'All') {
      // Label mixed keys if multiple exist
      const label = key.charAt(0).toUpperCase();
      content.push(`<strong>[${label}]</strong> ${data[key]}`);
    } else {
      content.push(data[key]);
    }
  });

  return content.join('\n\n') || null;
};
