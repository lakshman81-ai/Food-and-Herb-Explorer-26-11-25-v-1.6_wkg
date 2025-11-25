
export const stripHtml = (html: string) => {
   if (typeof document === 'undefined') return html;
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
};

// SEQUENTIAL TRUNCATION LOGIC (Concise Mode)
export const truncateText = (text: string) => {
     if (!text) return "";
     let clean = text;

     // --- FLOW STEP 1: Remove "More Info" Pointers (High Priority) ---
     // Logic: Removes any text matching (More info...) or [More info...].
     // Why First? Ensures that if a Basis marker (like R:) exists inside a "More info" block, 
     // it is removed here first so it doesn't trigger a premature cut-off of the main text.
     clean = clean.replace(/[\(\[]\s*More info.*?[\)\]]/gi, '');

     // --- FLOW STEP 2: Remove Square Brackets [...] (Medium Priority) ---
     // Logic: Removes all content within square brackets.
     // Why Second? Cleans up citations [1], notes [Note], or internal codes [///] to leave only readable text.
     clean = clean.replace(/\[[^\]]*\]/g, '');
     
     // --- FLOW STEP 3: Basis Cut-off (Critical Step) ---
     // Logic: Finds the markers G:, B:, or R: (General, Book, Research) and removes everything that follows them.
     // Condition: The marker must be at the start of the line (^) or preceded by whitespace (\s+).
     clean = clean.replace(/(\s+|^)[GBR]:[\s\S]*/i, '');

     // --- FLOW STEP 4: Artifact Cleanup ---
     // Logic: Trims any remaining leading or trailing punctuation (commas, dots, dashes) that might have been left behind after the cuts.
     clean = clean.replace(/^[\s\.,;:\-]+|[\s\.,;:\-]+$/g, '');

     return clean.trim();
};

// MEDICINAL TEXT PROCESSING (Herb Mode - Detailed View)
export const processMedicinalText = (text: string, expandBooks: boolean = true) => {
    if (!text) return "";
    let content = text;

    // 1. Expand Book Citations (if enabled)
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

    // 2. Handle Research Citations: Remove emoji wrappers and keep ID
    // Removes the title inside quotes if present, keeping only PMID/PMCID
    // Adds "Paper: " prefix
    content = content.replace(/\[(?:📌|🔬)\s*"?(?:[^"]*?)?((?:PMCID:\s*PMC\d+)|(?:PMID:\s*\d+))"?.?\]/gi, 'Paper: $1');

    // 3. Clean up any remaining citation wrappers [📌 ...] or [🔬 ...]
    content = content.replace(/\[(?:📌|🔬)\s*/g, '').replace(/\]/g, '');

    // 4. Format Ratings (Ayurvedic & Scientific) with Bold/Italic
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
        // Regex matches boundaries to avoid partial matches (e.g. finding 'Sci: S' inside 'Sci: Strong')
        // Handles optional whitespace around colon by replacing ':' with ':\s*' in regex generation
        const regex = new RegExp(`\\b${r.key.replace(':', ':\\s*')}\\b`, 'gi');
        content = content.replace(regex, `<strong>${r.label}:</strong> <span class="font-bold italic">${r.val}</span>`);
    });

    // 5. Linkify PMCID
    content = content.replace(
        /(PMCID:\s*)(PMC\d+)/gi,
        '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );
    
    // 6. Linkify PMID
    content = content.replace(
        /(PMID:\s*)(\d+)/gi,
        '<a href="https://pubmed.ncbi.nlm.nih.gov/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );

    // Ensure newlines are preserved as HTML line breaks for display
    return content.replace(/\n/g, '<br />');
};
