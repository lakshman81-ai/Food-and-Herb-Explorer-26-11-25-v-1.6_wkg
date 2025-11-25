
const herbCategories: Record<string, string[]> = {
    'Digestive': ['digestion', 'indigestion', 'gas', 'bloating', 'acidity', 'heartburn', 'diarrhea', 'nausea', 'colic', 'flatulence', 'gut', 'stomach'],
    'Hormonal': ['hormonal', 'menstrual', 'pcos', 'endocrine', 'pms', 'menopause', 'libido', 'fertility', 'galactagogue', 'shukra'],
    'Immunity': ['immunity', 'immunomodulator', 'cold', 'flu', 'cough', 'fever', 'sore throat', 'congestion', 'bronchitis', 'antiviral', 'antimicrobial'],
    'Stress & Sleep': ['stress', 'anxiety', 'sleep', 'insomnia', 'sedative', 'nervine', 'adaptogenic', 'cortisol', 'hpa axis'],
    'Pain & Inflammation': ['pain', 'inflammation', 'inflammatory', 'analgesic', 'aches', 'headache', 'arthritis', 'antispasmodic'],
    'Skin & Wounds': ['skin', 'acne', 'itchy', 'wounds', 'cuts', 'dermatitis', 'psoriasis', 'antifungal'],
    'Cognitive': ['cognitive', 'nervine', 'brain', 'memory', 'nootropic', 'brahmi'],
    'Metabolic': ['metabolic', 'diabetes', 'sugar', 'glycemic', 'cholesterol', 'lipid', 'insulin'],
    'Detox & Liver': ['detox', 'liver', 'hepatoprotective', 'jaundice', 'amrita', 'giloy'],
};

const categoryColumns: Record<string, string[]> = {
    'Digestive': ['Indigestion', 'Gas / Bloating', 'Acidity / Heartburn', 'Mild Diarrhea', 'Nausea'],
    'Hormonal': ['Hormonal impact'],
    'Immunity': ['Common Cold', 'Cough (Dry/Wet)', 'Sore Throat', 'Nasal Congestion', 'Mild Seasonal Allergies', 'Mild Fever', 'Seasonal immunity'],
    'Stress & Sleep': ['Mild Stress/Anxiety', 'Poor Sleep (Mild)'],
    'Pain & Inflammation': ['Body Aches', 'Mild Headache'],
    'Skin & Wounds': ['Acne', 'Itchy Skin', 'Minor Cuts/Wounds'],
};

export const categorizeHerb = (row: any): string => {
    const scores: Record<string, number> = {};
    const traditionalUse = (row['Traditional Use'] || '').toLowerCase();

    Object.keys(herbCategories).forEach(cat => scores[cat] = 0);

    for (const category in herbCategories) {
        for (const keyword of herbCategories[category]) {
            if (traditionalUse.includes(keyword)) {
                scores[category] += 2;
            }
        }
    }

    for (const category in categoryColumns) {
        for (const column of categoryColumns[category]) {
            const cellValue = (row[column] || '').toLowerCase();
            if (cellValue.includes('ayur:e')) {
                scores[category] += 3;
            } else if (cellValue.includes('ayur:g')) {
                scores[category] += 1;
            }
        }
    }

    for (const category in herbCategories) {
        for (const keyword of herbCategories[category]) {
            for(const col in row) {
                if (col === 'Traditional Use' || (categoryColumns[category] && categoryColumns[category].includes(col))) continue;

                if((row[col] || '').toLowerCase().includes(keyword)) {
                    scores[category] += 0.5;
                }
            }
        }
    }

    let maxScore = 0;
    let bestCategory = '';

    for (const category in scores) {
        if (scores[category] > maxScore) {
            maxScore = scores[category];
            bestCategory = category;
        }
    }

    return bestCategory || 'Medicinal Herbs';
};
