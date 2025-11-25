
import type { SectionDefinition } from './types';

export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRQTEztCwC34GwFO1SN4evMaaZc2LxSMgI9Z8rgNh6VdiRPzRgswBFuXFWUxFd-g/pub?output=csv';
export const HERB_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTlDMRGa7Awndvu8kMlP2D6BDelmNjoxo2RkSqVcHq7DnNZ9s7_PAxOGxKznmvmhyqKFRlv2uEtaBli/pub?output=csv';

export const BASIS_MARKERS = [
    { basis: 'Research', patterns: ['research basis', 'research:', 'r:', 'r -'] },
    { basis: 'Book', patterns: ['book basis', 'book:', 'b:', 'b -'] },
    { basis: 'Gen', patterns: ['gen basis', 'gen:', 'g:', 'g -'] },
];

const defineField = (key: string, displayName: string | null = null) => ({ key, displayName });

export const sectionDefinitions: Record<string, SectionDefinition> = {
    "Nutrition": {
        id: "nutrition",
        icon: "fitness_center",
        color: "#10B981",
        tailwind: 'emerald-500',
        fields: [
            defineField("Macros"),
            defineField("Micros"),
            defineField("Macros Health Effect"),
            defineField("Fat Type (%)"),
            defineField("Fatty Acid Breakdown (%) (only for Oil)"),
            defineField("Fatty Acid Composition (Detailed %) (only for Diary)"),
            defineField("Omega Profile (n-3/n-6 ratio) (only for Oil)"),
            defineField("CLA & SCFA Profile (mg/g or %) (only for Diary)")
        ]
    },
    "Bioactives": {
        id: "bioactives",
        icon: "bolt",
        color: "#06B6D4",
        tailwind: 'cyan-500',
        fields: [
            defineField("Key Bioactives (mg/g)"),
            defineField("TPC (mg GAE/g)"),
            defineField("Antioxidant Compounds (Functional Breakdown)"),
            defineField("Probiotic / Bioactive Peptide Insight (only for Diary)"),
            defineField("Active Constituents")
        ]
    },
    "Usage & Safety": {
        id: "usage",
        icon: "health_and_safety",
        color: "#F59E0B",
        tailwind: 'amber-500',
        fields: [
            defineField("Ideal Preparation"),
            defineField("Ideal Dosage"),
            defineField("Maximiser"),
            defineField("Potential health Impacts"),
            defineField("Clinical Synergy / Key Combinations (Only for herbs)"),
            defineField("Proposed Mechanism(s)"),
            defineField("Safety & Toxicity Conflicts"),
            defineField("Anupana & Pharmacokinetics")
        ]
    },
    "Metabolic": {
        id: "metabolic",
        icon: "speed",
        color: "#8B5CF6",
        tailwind: 'violet-500',
        fields: [
            defineField("Insulin Impact (GL)"),
            defineField("Harmonal effects"),
            defineField("Modern Clinical Insight"),
            defineField("Hormonal impact")
        ]
    },
    "Fermentation": {
        id: "tradition",
        icon: "bubble_chart",
        color: "#A16207",
        tailwind: 'yellow-700',
        fields: [
            defineField("Notes, Fermentation Effect"),
            defineField("Fermentation Mechanism & Ayurvedic Parallel (only for Diary)")
        ]
    },
    "Herbal Insights": {
        id: "herbal",
        icon: "eco",
        color: "#14B8A6",
        tailwind: 'teal-500',
        fields: [
            defineField("Active Phytochemical Class (only for Herbs)"),
            defineField("Effect When Taken Before Food (Only for herbs)"),
            defineField("Effect When Taken After Food (Only for herbs)"),
            defineField("Circadian / Metabolic Phase"),
            defineField("Neuroendocrine & Hormonal Synchrony"),
            defineField("Energetics (Trad.)"),
            defineField("Botanical Name")
        ],
        isConditional: true
    },
    "Medicinal Values": {
        id: "medicinal",
        icon: "healing",
        color: "#BE185D",
        tailwind: 'pink-700',
        fields: [
            defineField("Common Cold"),
            defineField("Cough (Dry/Wet)"),
            defineField("Sore Throat"),
            defineField("Nasal Congestion"),
            defineField("Body Aches"),
            defineField("Mild Headache"),
            defineField("Indigestion"),
            defineField("Gas / Bloating"),
            defineField("Acidity / Heartburn"),
            defineField("Mild Diarrhea"),
            defineField("Nausea"),
            defineField("Mild Seasonal Allergies"),
            defineField("Mild Fever"),
            defineField("Acne"),
            defineField("Itchy Skin"),
            defineField("Minor Cuts/Wounds"),
            defineField("Mild Stress/Anxiety"),
            defineField("Poor Sleep (Mild)"),
            defineField("Seasonal immunity"),
            defineField("Dehydration")
        ],
        isConditional: true
    },
    "Traditional Wisdom": {
        id: "notes",
        icon: "history_edu",
        color: "#64748B",
        tailwind: 'slate-500',
        fields: [
            defineField("Notes / Traditional Wisdom"),
            defineField("Ayurvedic Energetics & Lipid Function (only for Oil)"),
            defineField("Ayurvedic Energetics in plain English (Only for herbs)"),
            defineField("Basis(Leaf/Root) (only for herbs)"),
            defineField("Traditional Use"),
            defineField("Polyvalent/Additive Combinations"),
            defineField("Pharmacokinetic Synergy")
        ]
    },
    "References": {
        id: "references",
        icon: "menu_book",
        color: "#94A3B8",
        tailwind: 'slate-400',
        fields: [
            defineField("Cite (PubMed)"),
            defineField("Book basis"),
            defineField("Basis(Leaf/Root) (only for herbs)")
        ]
    }
};
