
export const stripHtml = (html: string) => {
   if (typeof document === 'undefined') return html;
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
};

// SEQUENTIAL TRUNCATION LOGIC (Concise Mode) - As per user specification
export const truncateText = (text: string) => {
     if (!text) return "";
     let clean = text;

     // --- Specification Step 1: Remove "More Info" Pointers (High Priority) ---
     // Logic: Removes any text matching (More info...) or [More info...].
     // Why First? Ensures that if a Basis marker (like R:) exists inside a "More info" block, 
     // it is removed here first so it doesn't trigger a premature cut-off of the main text.
     clean = clean.replace(/[\(\[]\s*More info.*?[\)\]]/gi, '');

     // --- Specification Step 2: Remove Square Brackets [...] (Medium Priority) ---
     // Logic: Removes all content within square brackets.
     // Why Second? Cleans up citations [1], notes [Note], or internal codes [///] to leave only readable text.
     clean = clean.replace(/\[[^\]]*\]/g, '');
     
     // --- Specification Step 3: Basis Cut-off (Critical Step) ---
     // Logic: Finds the markers G:, B:, or R: (General, Book, Research) and removes everything that follows them.
     // Condition: The marker must be at the start of the line (^) or preceded by whitespace (\s+).
     clean = clean.replace(/(\s+|^)[GBR]:[\s\S]*/i, '');

     // --- Specification Step 4: Artifact Cleanup ---
     // Logic: Trims any remaining leading or trailing punctuation (commas, dots, dashes) that might have been left behind after the cuts.
     clean = clean.replace(/^[\s\.,;:\-]+|[\s\.,;:\-]+$/g, '');

     return clean.trim();
};

// MEDICINAL TEXT PROCESSING (Herb Mode - Detailed View) - As per user specification
export const processMedicinalText = (text: string, expandBooks: boolean = true) => {
    if (!text) return "";
    let content = text;

    // Specification: Expands Citations
    if (expandBooks) {
        content = content.replace(
            /Lad,\s*p\.\s*(\d+)/gi,
            "The Complete Book of Ayurvedic Home Remedies, Vasant Lad (Page $1)"
        );
        content = content.replace(
            /CCRAS,\s*p\.\s*(\d+)/gi,
            "CCRA, Ministry of Health (Page $1)"
        );
    }

    // Specification: Cleans Wrappers
    content = content.replace(/\[(?:📌|🔬)\s*"?(?:[^"]*?)?((?:PMCID:\s*PMC\d+)|(?:PMID:\s*\d+))"?.?\]/gi, 'Paper: $1');
    content = content.replace(/\[(?:📌|🔬)\s*/g, '').replace(/\]/g, '');

    // Specification: Formats Ratings
    const ratings = [
        { key: "Ayur:E", label: "Ayurvedic", val: "Excellent" },
        { key: "Ayur:G", label: "Ayurvedic", val: "Good" },
        { key: "Ayur:N", label: "Ayurvedic", val: "Nominal" },
        { key: "Sci:S", label: "Scientific studies", val: "Strong Clinical Support" },
        { key: "Sci:M", label: "Scientific studies", val: "Moderate Clinical Support" },
        { key: "Sci:L", label: "Scientific studies", val: "Limited" },
        { key: "Sci:N", label: "Scientific studies", val: "None or Contraindicated" },
    ];

    ratings.forEach(r => {
        const regex = new RegExp(`\\b${r.key.replace(':', ':\\s*')}\\b`, 'gi');
        content = content.replace(regex, `<strong>${r.label}:</strong> <span class="font-bold italic">${r.val}</span>`);
    });

    // Specification: Linkifies IDs
    content = content.replace(
        /(PMCID:\s*)(PMC\d+)/gi,
        '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );
    
    content = content.replace(
        /(PMID:\s*)(\d+)/gi,
        '<a href="https://pubmed.ncbi.nlm.nih.gov/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );

    return content.replace(/\n/g, '<br />');
};
