
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { FoodData, Basis, AILoadingState, StructuredRecipe, SearchResult, SearchMatch } from './types';
import { CSV_URL, HERB_CSV_URL, sectionDefinitions } from './constants';
import { identifyFood, getRecipeIdea, RecipeContext } from './services/geminiService';
import { isValidContent, formatData } from './utils/dataUtils';
import { truncateText, processMedicinalText, stripHtml } from './utils/textUtils';
import AILoadingModal from './components/AILoadingModal';
import SearchModal from './components/SearchModal';
import ErrorBoundary from './components/ErrorBoundary';
import { mockFoodData } from './mockData';

// External PapaParse type definition for window object
declare global {
    interface Window {
        Papa: any;
        google: any;
    }
}

const CATEGORY_ICONS: Record<string, string> = {
    'Fruits': '🍎',
    'Vegetables': '🥦',
    'Nuts': '🌰',
    'Seeds': '🌻',
    'Legumes': '🫘',
    'Grains': '🌾',
    'Oils': '🫒',
    'Dairy': '🥛',
    'Spices': '🌶️',
    'Herbs': '🌿',
    'Medicinal Herbs': '🍵',
    'Roots': '🥕',
    'Leaves': '🥬',
    'Flowers': '🌸',
    'Beverages': '☕',
    'Mushrooms': '🍄',
    'Tubers': '🥔',
    'Cereals': '🥣',
    'Resins': '🏺',
    'Barks': '🪵',
    'Fish': '🐟',
    'Meat': '🥩',
    'Seafood': '🦐',
    'Poultry': '🍗',
    'Sweets': '🍬',
    'Sweeteners': '🍯',
    'Condiments': '🧂'
};

const CATEGORY_IMAGES: Record<string, string> = {
    'Fruits': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=300&q=80',
    'Fruit': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=300&q=80',
    'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=300&q=80',
    'Vegetable': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=300&q=80',
    'Nuts': 'https://images.unsplash.com/photo-1596627339615-d7856524687c?auto=format&fit=crop&w=300&q=80',
    'Nuts & Seeds': 'https://images.unsplash.com/photo-1508595165502-3e2652e5a405?auto=format&fit=crop&w=300&q=80',
    'Seeds': 'https://images.unsplash.com/photo-1508595165502-3e2652e5a405?auto=format&fit=crop&w=300&q=80',
    'Legumes': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=300&q=80',
    'Grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80',
    'Grains & Legumes': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80',
    'Oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    'Oils & Fats': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80',
    'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=300&q=80',
    'Spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    'Herbs': 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?auto=format&fit=crop&w=300&q=80',
    'Medicinal Herbs': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',
    'Herbs/Spices': 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?auto=format&fit=crop&w=300&q=80',
    'Roots': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=300&q=80',
    'Leaves': 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?auto=format&fit=crop&w=300&q=80',
    'Flowers': 'https://images.unsplash.com/photo-1490750967868-58cb75069ed6?auto=format&fit=crop&w=300&q=80',
    'Beverages': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80',
    'Mushrooms': 'https://images.unsplash.com/photo-1504472418-b35c616350f4?auto=format&fit=crop&w=300&q=80',
    'Mushroom': 'https://images.unsplash.com/photo-1504472418-b35c616350f4?auto=format&fit=crop&w=300&q=80',
    'Tubers': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80',
    'Cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    'Resins': 'https://images.unsplash.com/photo-1615485925763-867862889095?auto=format&fit=crop&w=300&q=80',
    'Barks': 'https://images.unsplash.com/photo-1589307904488-7d715274959c?auto=format&fit=crop&w=300&q=80',
    'Fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80',
    'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=300&q=80',
    'Seafood': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=300&q=80',
    'Poultry': 'https://images.unsplash.com/photo-1587593810167-a84920ea0742?auto=format&fit=crop&w=300&q=80',
    'Sweets': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80',
    'Sweeteners': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80',
    'Condiments': 'https://images.unsplash.com/photo-1592242335006-999228619366?auto=format&fit=crop&w=300&q=80'
};

export default function App() {
    const [foodData, setFoodData] = useState<FoodData>({});
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [basis, setBasis] = useState<Basis>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchCategory, setSearchCategory] = useState('');
    const [aiState, setAiState] = useState<AILoadingState>({ show: false, message: '', showSpinner: false, showClose: false });
    const [aiRecipe, setAiRecipe] = useState<StructuredRecipe | null>(null);
    const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>([]);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [appMode, setAppMode] = useState<'foods' | 'herbs'>('foods');
    const [recipeBasket, setRecipeBasket] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isTamil, setIsTamil] = useState(false);

    const loadRef = useRef(false);
    const translationPollingRef = useRef<any>(null);

    // Sync initial state with Google Translate status
    useEffect(() => {
        const checkTranslationState = () => {
             const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
             if (combo && combo.value === 'ta') {
                 setIsTamil(true);
             } else if (document.cookie.includes('googtrans=/en/ta')) {
                 setIsTamil(true);
             }
        };
        
        const t1 = setTimeout(checkTranslationState, 1000);
        const t2 = setTimeout(checkTranslationState, 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const handleRefresh = () => {
        setFoodData({});
        setLoading(true);
        setSelectedCategory(null);
        setSelectedFood(null);
        setBasis('All');
        setSearchTerm('');
        setIsSearchOpen(false);
        setSearchResults([]);
        setAiState({ show: false, message: '', showSpinner: false, showClose: false });
        setAiRecipe(null);
        setSuggestedIngredients([]);
        setRecipeBasket([]);
        setRefreshKey(prev => prev + 1);
        loadRef.current = false;
    };

    const robustProcessCsv = (text: string, isHerbMode: boolean): FoodData => {
        const result: FoodData = {};
        if (!window.Papa) {
            console.error("PapaParse not loaded");
            return result;
        }

        const isFlattened = isHerbMode;

        window.Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                results.data.forEach((row: any) => {
                    let category = row['Category'] || row['Food Category'] || row['Group'];
                    if (!category && isHerbMode) {
                        const basis = row['Basis'] || '';
                        if (basis.toLowerCase().includes('root')) category = 'Roots';
                        else if (basis.toLowerCase().includes('leaf')) category = 'Leaves';
                        else if (basis.toLowerCase().includes('bark')) category = 'Barks';
                        else if (basis.toLowerCase().includes('resin')) category = 'Resins';
                        else if (basis.toLowerCase().includes('flower')) category = 'Flowers';
                        else if (basis.toLowerCase().includes('seed')) category = 'Seeds';
                        else if (basis.toLowerCase().includes('fruit')) category = 'Fruits';
                        else category = 'Medicinal Herbs';
                    }
                    if (!category) return;

                    category = category.trim();

                    const foodName = row['Food Name'] || row['Food'] || row['Name'] || row['Herb Name'] || row['Herb'] || row['English Name'];
                    if (!foodName) return;

                    const cleanName = foodName.trim();

                    if (!result[category]) {
                        result[category] = {};
                    }

                    if (!result[category][cleanName]) {
                        result[category][cleanName] = {};
                    }

                    const details = result[category][cleanName];

                    if (isFlattened) {
                        Object.keys(row).forEach(header => {
                            if (header === 'Category' || header === 'Food Name' || header === 'Food' || header === 'Name' || header === 'Herb Name' || header === 'English Name' || header === 'Basis') return;
                             const val = row[header]?.trim();
                             if (val && val !== 'N/A') {
                                 if (!details[header]) details[header] = {};
                                 details[header]['All'] = val;
                             }
                        });
                        const img = row['Image URL'] || row['Image'];
                        if (img) details['_imageUrl'] = { All: img };
                        
                        // Capture Basis for Wisdom
                        if (row['Basis']) {
                             const basisKey = 'Basis(Leaf/Root) (only for herbs)';
                             if (!details[basisKey]) details[basisKey] = {};
                             details[basisKey]['All'] = row['Basis'];
                        }

                    } else {
                        const basis = row['Basis'] || 'All';
                        Object.keys(row).forEach(header => {
                            if (header === 'Category' || header === 'Food Name' || header === 'Food' || header === 'Name' || header === 'Basis') return;
                             const val = row[header]?.trim();
                             if (val && val !== 'N/A') {
                                 if (!details[header]) details[header] = {};
                                 details[header][basis] = val;
                             }
                        });
                        const img = row['Image URL'] || row['Image'];
                         if (img) {
                             if (!details['_imageUrl']) details['_imageUrl'] = {} as any;
                             details['_imageUrl'][basis] = img;
                         }
                    }
                });
            }
        });
        return result;
    };

    useEffect(() => {
        setFoodData(mockFoodData);
        setLoading(false);
    }, []);

    useEffect(() => {
        setLoading(true);
        setSelectedCategory(null);
        setSelectedFood(null);

        const url = appMode === 'foods' ? CSV_URL : HERB_CSV_URL;
        
        fetch(url)
            .then(r => r.text())
            .then(text => {
                const parsed = robustProcessCsv(text, appMode === 'herbs');
                if (Object.keys(parsed).length > 0) {
                    setFoodData(parsed);
                }
            })
            .catch(err => {
                console.error("Failed to load live data", err);
            })
            .finally(() => setLoading(false));
    }, [appMode, refreshKey]);

    const categories = useMemo(() => Object.keys(foodData).sort(), [foodData]);

    const activeFoodDetails = useMemo(() => {
        if (selectedCategory && selectedFood && foodData[selectedCategory]) {
            return foodData[selectedCategory][selectedFood];
        }
        return null;
    }, [foodData, selectedCategory, selectedFood]);

    useEffect(() => {
        if (activeFoodDetails) {
            const maximiserText = formatData(activeFoodDetails['Maximiser'], basis) || '';
            const polyvalentText = formatData(activeFoodDetails['Polyvalent/Additive Combinations'], basis) || '';
            
            const combinedText = `${maximiserText} ${polyvalentText}`.trim();

            if (combinedText) {
                let processedText = combinedText;
                
                // SEQUENTIAL LOGIC for SUGGESTED INGREDIENTS
                // Step A (Pre-Split): Remove (More info...) blocks
                processedText = processedText.replace(/[\(\[]\s*More info.*?[\)\]]/gi, ' ');
                
                // Step B (Pre-Split): Remove [...] content strictly
                // This prevents comma-splitting inside citations like [Lad, 98]
                processedText = processedText.replace(/\[[^\]]*\]/g, ' ');
                
                // Step C (Split)
                const rawSuggestions = processedText.split(/[.,;]/).map(s => s.trim());
                
                // Step D (Post-Split): Run standard truncation logic on each item
                const cleanedSuggestions = rawSuggestions.map(s => {
                     return truncateText(s); 
                }).filter(s => s.length > 2 && isValidContent(s));

                const uniqueSuggestions = Array.from(new Set(cleanedSuggestions));
                setSuggestedIngredients(uniqueSuggestions);
            } else {
                setSuggestedIngredients([]);
            }
        }
    }, [activeFoodDetails, basis]);

    useEffect(() => {
        if (selectedFood) {
            setBasis('All');
            setShowMoreInfo(false);
            window.scrollTo(0, 0);
        }
    }, [selectedFood]);

    const handleBasisChange = (newBasis: Basis) => {
        setBasis(newBasis);
        if (newBasis === 'All') {
            setShowMoreInfo(false);
        } else {
            setShowMoreInfo(true);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    useEffect(() => {
        if (searchTerm.length <= 1) {
            setSearchResults([]);
            return;
        }

        const results: SearchResult[] = [];
        const lowerTerm = searchTerm.toLowerCase();

        Object.keys(foodData).forEach(cat => {
            if (searchCategory && searchCategory !== cat) return;
            
            Object.keys(foodData[cat]).forEach(food => {
                const details = foodData[cat][food];
                const matches: SearchMatch[] = [];

                if (food.toLowerCase().includes(lowerTerm)) {
                    matches.push({ section: 'Name', snippet: food });
                }

                Object.keys(details).forEach(header => {
                    const content = formatData(details[header], basis);
                    if (content && content.toLowerCase().includes(lowerTerm)) {
                        const idx = content.toLowerCase().indexOf(lowerTerm);
                        const start = Math.max(0, idx - 20);
                        const end = Math.min(content.length, idx + searchTerm.length + 30);
                        let snippet = content.substring(start, end);
                        if (start > 0) snippet = '...' + snippet;
                        if (end < content.length) snippet = snippet + '...';
                        
                        snippet = snippet.replace(new RegExp(searchTerm, 'gi'), (m) => `<span class='bg-yellow-200 font-bold'>${m}</span>`);
                        matches.push({ section: header, snippet });
                    }
                });

                if (matches.length > 0) {
                    results.push({ food, category: cat, matches });
                }
            });
        });

        setSearchResults(results);
    }, [searchTerm, searchCategory, foodData, basis]);

    const handleQuickRecipeGen = async (term: string) => {
        setIsSearchOpen(false);
        setAiState({ show: true, message: `Scanning Matrix for "${term}"...`, showSpinner: true, showClose: false });
        setAiRecipe(null);

        try {
            let herbDB: FoodData | null = appMode === 'herbs' ? foodData : null;
            let foodDB: FoodData | null = appMode === 'foods' ? foodData : null;

            if (!herbDB) {
                 setAiState(prev => ({ ...prev, message: `Accessing Herb Matrix...` }));
                 const resp = await fetch(HERB_CSV_URL);
                 const text = await resp.text();
                 herbDB = robustProcessCsv(text, true);
            }

            if (!foodDB) {
                 setAiState(prev => ({ ...prev, message: `Accessing Food Matrix...` }));
                 const resp = await fetch(CSV_URL);
                 const text = await resp.text();
                 foodDB = robustProcessCsv(text, false);
            }
            
            const scoredHerbs: { name: string, score: number, details: any, matchReason: string }[] = [];
            
            Object.keys(herbDB).forEach(cat => {
                Object.keys(herbDB![cat]).forEach(food => {
                    const details = herbDB![cat][food];
                    let score = 0;
                    let reason = '';

                    const medicinalFields = sectionDefinitions['Medicinal Values'].fields.map(f => f.key);
                    
                    medicinalFields.forEach(field => {
                        const val = formatData(details[field], 'All');
                        if (val && val.toLowerCase().includes(term.toLowerCase())) {
                            let fieldScore = 1;
                            if (val.includes('Ayur: E') || val.includes('Ayur:E') || val.includes('Sci: S') || val.includes('Sci:S')) {
                                fieldScore = 3; 
                            } else if (val.includes('Ayur: G') || val.includes('Ayur:G') || val.includes('Sci: M') || val.includes('Sci:M')) {
                                fieldScore = 2;
                            }
                            
                            if (fieldScore > score) {
                                score = fieldScore;
                                reason = `${field}: ${truncateText(val)}`;
                            }
                        }
                    });

                    if (score > 0) {
                        scoredHerbs.push({ name: food, score, details, matchReason: reason });
                    }
                });
            });

            scoredHerbs.sort((a, b) => b.score - a.score);
            const topHerbs = scoredHerbs.slice(0, 3);

            if (topHerbs.length === 0) {
                setAiState({ show: true, message: `No specific herbs found for "${term}" in the current database. Try switching modes or a different keyword.`, showSpinner: false, showClose: true });
                return;
            }

            setAiState(prev => ({ ...prev, message: `Found top herbs: ${topHerbs.map(h => h.name).join(', ')}. Analyzing synergy...` }));

            const baseFoods: { name: string; preparation: string | null }[] = [];
            const maximisers: string[] = [];
            let scientificContext = `Remedy focused on: ${term}.\n\n`;

            topHerbs.forEach(h => {
                const prep = formatData(h.details['Ideal Preparation'] || h.details['Anupana & Pharmacokinetics'], 'All');
                baseFoods.push({ name: h.name, preparation: truncateText(prep || 'Standard infusion') });

                scientificContext += `HERB: ${h.name}\n`;
                scientificContext += ` - Match: ${h.matchReason}\n`;
                scientificContext += ` - Wisdom: ${truncateText(formatData(h.details['Notes / Traditional Wisdom'], 'All') || '')}\n`;
                scientificContext += ` - Anupana: ${truncateText(formatData(h.details['Anupana & Pharmacokinetics'], 'All') || '')}\n`;
                
                const synergy = formatData(h.details['Polyvalent/Additive Combinations'] || h.details['Maximiser'], 'All');
                if (synergy) {
                    scientificContext += ` - Synergy: ${truncateText(synergy)}\n`;
                    if (foodDB) {
                         Object.keys(foodDB).forEach(fCat => {
                            Object.keys(foodDB![fCat]).forEach(fFood => {
                                if (synergy.toLowerCase().includes(fFood.toLowerCase()) && fFood.length > 3) {
                                     const fDetails = foodDB![fCat][fFood];
                                     const fPrep = formatData(fDetails['Ideal Preparation'], 'All');
                                     scientificContext += ` - Maximiser Found (${fFood}): Ideal Prep - ${truncateText(fPrep || 'N/A')}\n`;
                                     maximisers.push(`${fFood} (${truncateText(fPrep || '')})`);
                                }
                            });
                         });
                    }
                    if (maximisers.length === 0) {
                        maximisers.push(truncateText(synergy));
                    }
                }
                scientificContext += '\n';
            });

            const context: RecipeContext = {
                baseFoods,
                maximiserFoods: maximisers,
                nutritionalContext: scientificContext,
                ayurvedicContext: "Focus on balancing doshas related to the ailment.",
                bioactivesContext: "Maximize bioavailability of active compounds.",
                synergyContext: "Utilize polyvalent combinations provided in the analysis."
            };

            setAiState(prev => ({ ...prev, message: 'Synthesizing scientific remedy recipe...' }));
            const recipe = await getRecipeIdea(context, 'herb');
            setAiRecipe(recipe);
            setAiState(prev => ({ ...prev, showSpinner: false, showClose: true, message: '' }));

        } catch (e) {
            console.error(e);
            setAiState({ show: true, message: 'Error generating remedy.', showSpinner: false, showClose: true });
        }
    };

    const toggleBasketItem = (foodName: string) => {
        setRecipeBasket(prev => {
            if (prev.includes(foodName)) return prev.filter(f => f !== foodName);
            return [...prev, foodName];
        });
    };

    const handleGenerateRecipe = async () => {
        if (!activeFoodDetails && recipeBasket.length === 0) return;
        
        setAiState({ show: true, message: 'Analyzing ingredients...', showSpinner: true, showClose: false });
        setAiRecipe(null);

        try {
            const baseFoods = [];
            
            if (selectedFood && activeFoodDetails) {
                 const prep = formatData(activeFoodDetails['Ideal Preparation'], basis);
                 baseFoods.push({ name: selectedFood, preparation: truncateText(prep || '') });
            }

            recipeBasket.forEach(itemName => {
                if (itemName === selectedFood) return;
                let itemData = null;
                for (const cat of Object.keys(foodData)) {
                    if (foodData[cat][itemName]) {
                        itemData = foodData[cat][itemName];
                        break;
                    }
                }
                if (itemData) {
                     const prep = formatData(itemData['Ideal Preparation'], basis);
                     baseFoods.push({ name: itemName, preparation: truncateText(prep || '') });
                } else {
                    baseFoods.push({ name: itemName, preparation: null });
                }
            });

            if (baseFoods.length === 0) throw new Error("No ingredients selected");

            let nutritionalContext = "";
            let ayurvedicContext = "";
            let bioactivesContext = "";
            let synergyContext = "";

            const contextSource = activeFoodDetails || (baseFoods[0].name ? (function(){
                 for (const cat of Object.keys(foodData)) {
                    if (foodData[cat][baseFoods[0].name]) return foodData[cat][baseFoods[0].name];
                }
                return null;
            })() : null);


            if (contextSource) {
                 nutritionalContext = truncateText(formatData(contextSource['Specific Benefits'] || contextSource['Macros Health Effect'], basis) || "");
                 ayurvedicContext = truncateText(formatData(contextSource['Ayurvedic Energetics in plain English'] || contextSource['Energetics (Trad.)'], basis) || "");
                 bioactivesContext = truncateText(formatData(contextSource['Key Bioactives (mg/g)'] || contextSource['Active Constituents'], basis) || "");
                 synergyContext = truncateText(formatData(contextSource['Clinical Synergy / Key Combinations (Only for herbs)'] || contextSource['Polyvalent/Additive Combinations'], basis) || "");
            }

            const context: RecipeContext = {
                baseFoods,
                maximiserFoods: suggestedIngredients,
                nutritionalContext,
                ayurvedicContext,
                bioactivesContext,
                synergyContext
            };

            setAiState(prev => ({ ...prev, message: appMode === 'herbs' ? 'Formulating Remedy Mix...' : 'Chef AI is creating your recipe...' }));
            const recipe = await getRecipeIdea(context, appMode === 'food' ? 'food' : 'herb');
            setAiRecipe(recipe);
            setAiState(prev => ({ ...prev, showSpinner: false, showClose: true, message: '' }));

        } catch (error) {
            setAiState({ show: true, message: 'Could not generate. Please try again.', showSpinner: false, showClose: true });
        }
    };

    const handleCapture = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            setAiState({ show: true, message: 'Identifying food...', showSpinner: true, showClose: false });
            try {
                const identifiedName = await identifyFood(file);
                setAiState(prev => ({ ...prev, message: `Found: ${identifiedName}. Searching database...` }));
                
                let found = false;
                for (const cat of Object.keys(foodData)) {
                    if (foodData[cat][identifiedName]) {
                        setSelectedCategory(cat);
                        setSelectedFood(identifiedName);
                        found = true;
                        break;
                    }
                }

                if (found) {
                     setAiState({ show: false, message: '', showSpinner: false, showClose: false });
                } else {
                     setAiState({ show: true, message: `Identified as ${identifiedName}, but not found in our specific database yet.`, showSpinner: false, showClose: true });
                }

            } catch (err) {
                setAiState({ show: true, message: 'Could not identify image.', showSpinner: false, showClose: true });
            }
        };
        input.click();
    };

    const visibleSections = useMemo(() => {
        const sections = Object.entries(sectionDefinitions).filter(([_, def]) => {
            if (def.isConditional) {
                if (def.id === 'herbal' || def.id === 'medicinal') return appMode === 'herbs';
                return false; 
            }
            return true;
        });

        if (appMode === 'herbs') {
            const herbOrder = ['medicinal', 'notes', 'usage', 'herbal', 'metabolic', 'tradition', 'nutrition', 'references', 'bioactives'];
            sections.sort((a, b) => {
                const indexA = herbOrder.indexOf(a[1].id);
                const indexB = herbOrder.indexOf(b[1].id);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return 0;
            });
        }

        return sections;
    }, [appMode]);

    const toggleTamil = () => {
        if (translationPollingRef.current) return;

        const feedback = document.getElementById('tamil-feedback');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.textContent = "Connecting...";
        }

        let attempts = 0;
        const maxAttempts = 50; 
        
        const performToggle = () => {
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo) {
                if (isTamil) {
                    combo.value = 'en';
                } else {
                    combo.value = 'ta';
                }
                combo.dispatchEvent(new Event('change'));
                setIsTamil(!isTamil);
                
                if (feedback) {
                    feedback.textContent = !isTamil ? "Switched to Tamil" : "Switched to English"; 
                    setTimeout(() => { feedback.style.display = 'none'; }, 2000);
                }
                return true;
            }
            return false;
        };

        if (performToggle()) return;

        translationPollingRef.current = setInterval(() => {
            attempts++;
            if (performToggle()) {
                clearInterval(translationPollingRef.current!);
                translationPollingRef.current = null;
            } else if (attempts >= maxAttempts) {
                clearInterval(translationPollingRef.current!);
                translationPollingRef.current = null;
                if (feedback) {
                    feedback.style.display = 'none';
                }
                alert("Translation engine is still loading. Please check your internet and try again in a few seconds.");
            }
        }, 200);
    };

    const renderField = (label: string | null, content: string | null) => {
        if (!isValidContent(content)) return null;

        let displayContent = content!;
        
        const isAllBasis = basis === 'All';
        const shouldTruncate = (isAllBasis && !showMoreInfo) && !label?.includes("Medicinal");

        if (shouldTruncate) {
            displayContent = truncateText(displayContent);
        }

        displayContent = displayContent.replace(/^[\s\.,;:\-\[\]\(\)]+|[\s\.,;:\-\[\]\(\)]+$/g, '');
        if (!isValidContent(displayContent)) return null;

        const isMedicinalText = label && (label.includes("Medicinal") || label.includes("Ayurvedic") || label.includes("Scientific") || displayContent.includes("Ayur:") || displayContent.includes("Sci:") || label.includes("Hormonal impact"));

        if (isMedicinalText) {
            const shouldExpandBooks = label !== "Hormonal impact";
            displayContent = processMedicinalText(displayContent, shouldExpandBooks);
        } else {
            displayContent = displayContent.replace(/\n/g, '<br />');
        }

        return (
            <div className="mb-4 last:mb-0">
                {label && <h4 className="text-xl font-bold text-gray-800 mb-1.5">{label}</h4>}
                <div 
                    className="text-gray-800 text-lg leading-6"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            <header className="bg-white shadow-sm sticky top-0 z-40 safe-top">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         <button onClick={handleRefresh} className="focus:outline-none active:scale-90 transition-transform">
                            <div className="text-4xl">🌿</div>
                         </button>
                         
                        <div className="flex bg-gray-100 rounded-lg p-1.5">
                            <button
                                onClick={() => setAppMode('foods')}
                                className={`px-4 py-2 rounded-md text-base font-semibold flex items-center gap-2 transition-all ${appMode === 'foods' ? 'bg-white shadow-sm text-emerald-800' : 'text-gray-600'}`}
                            >
                                <span>🍎</span> Foods
                            </button>
                            <button
                                onClick={() => setAppMode('herbs')}
                                className={`px-4 py-2 rounded-md text-base font-semibold flex items-center gap-2 transition-all ${appMode === 'herbs' ? 'bg-white shadow-sm text-teal-800' : 'text-gray-600'}`}
                            >
                                <span>🍵</span> Herbs
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         {loading && <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>}
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="material-icons text-3xl">search</span>
                        </button>
                        <button 
                            onClick={handleCapture}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <span className="material-icons text-3xl">photo_camera</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pt-6">
                <ErrorBoundary>
                    {selectedCategory && (
                        <button 
                            onClick={() => selectedFood ? setSelectedFood(null) : setSelectedCategory(null)}
                            className="mb-6 flex items-center text-emerald-700 font-semibold hover:text-emerald-900 transition-colors text-lg"
                        >
                            <span className="material-icons text-2xl mr-1">arrow_back</span>
                            {selectedFood ? `Back to ${selectedFood}` : 'Back to Categories'}
                        </button>
                    )}

                    {recipeBasket.length > 0 && !selectedFood && (
                         <div className="mb-5 bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-xl">
                                <span className="material-icons text-lg">shopping_basket</span>
                                Current Mix ({recipeBasket.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {recipeBasket.map(item => (
                                    <span key={item} className="inline-flex items-center bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full text-base border border-emerald-200">
                                        {item}
                                        <button onClick={() => toggleBasketItem(item)} className="ml-3 hover:text-red-600 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                            <button 
                                onClick={handleGenerateRecipe}
                                className="mt-5 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
                            >
                                <span className="material-icons text-xl">auto_awesome</span>
                                Generate {appMode === 'herbs' ? 'Remedy' : 'Recipe'} from Mix
                            </button>
                         </div>
                    )}

                    {!selectedCategory && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {categories.length > 0 ? categories.map(category => {
                                 const fallbackIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS[category.replace(' & ', ' ')] || '🍱';
                                 let bgImage = CATEGORY_IMAGES[category];
                                 if (!bgImage) {
                                    const key = Object.keys(CATEGORY_IMAGES).find(k => category.includes(k) || k.includes(category));
                                    if (key) bgImage = CATEGORY_IMAGES[key];
                                 }

                                 return (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className="group relative bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden aspect-[4/5] flex flex-col"
                                    >
                                        <div className="absolute inset-0 bg-gray-200">
                                           {bgImage ? (
                                               <img 
                                                    src={bgImage} 
                                                    alt={category} 
                                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-emerald-50');
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-5xl">${fallbackIcon}</span>`;
                                                    }}
                                               />
                                           ) : (
                                               <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-5xl">
                                                   {fallbackIcon}
                                               </div>
                                           )}
                                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
                                        </div>
                                        
                                        <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                                            <h3 className="text-white font-bold text-xl tracking-wide shadow-black drop-shadow-md">{category}</h3>
                                            <span className="text-emerald-100 text-lg font-medium">{Object.keys(foodData[category]).length} items</span>
                                        </div>
                                    </button>
                                );
                            }) : (
                                <div className="col-span-full text-center py-12 text-gray-500 text-lg">
                                    {loading ? 'Loading data...' : 'No categories found.'}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedCategory && !selectedFood && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-5">{selectedCategory}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {Object.keys(foodData[selectedCategory]).sort().map(food => {
                                    const details = foodData[selectedCategory][food];
                                    const image = details['_imageUrl']?.['All'];
                                    const description = stripHtml(formatData(details['Specific Benefits'] || details['Macros Health Effect'], 'All') || 'Explore nutritional details...');
                                    const isSelected = recipeBasket.includes(food);

                                    return (
                                        <div key={food} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative border border-gray-100">
                                            <button 
                                                onClick={() => toggleBasketItem(food)}
                                                className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10 ${isSelected ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                <span className="material-icons text-xl">{isSelected ? 'check' : 'add'}</span>
                                            </button>

                                            <div onClick={() => setSelectedFood(food)} className="cursor-pointer flex-grow">
                                                 <div className="flex items-center gap-5 mb-4">
                                                    {image ? (
                                                        <img src={image} alt={food} className="w-20 h-20 rounded-full object-cover bg-gray-100" />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
                                                            <span className="material-icons text-emerald-300">restaurant</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-xl mb-1">{food}</h3>
                                                        <p className="text-base text-gray-700 line-clamp-2">{description}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center text-emerald-700 text-base font-bold">
                                                    View Analysis <span className="material-icons text-base ml-2">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedFood && activeFoodDetails && (
                        <div className="pb-20">
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-5 border border-gray-100">
                                <div className="relative h-72 md:h-96">
                                    {activeFoodDetails['_imageUrl']?.['All'] ? (
                                        <img 
                                            src={activeFoodDetails['_imageUrl']['All']} 
                                            alt={selectedFood} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                                            <span className="text-9xl opacity-20">🥗</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 text-white">
                                        <h1 className="text-4xl md:text-6xl font-bold mb-3 shadow-black drop-shadow-lg">{selectedFood}</h1>
                                        <p className="opacity-95 text-xl font-medium max-w-2xl">
                                            {stripHtml(formatData(activeFoodDetails['Scientific Name'] || activeFoodDetails['Botanical Name'], basis) || selectedCategory)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
                                     <div className="flex gap-2 sm:gap-3 flex-nowrap">
                                        <button 
                                            onClick={handleGenerateRecipe}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 sm:px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 font-bold text-base whitespace-nowrap"
                                        >
                                            <span className="material-icons text-lg">auto_awesome</span>
                                            {appMode === 'herbs' ? 'Remedy Mix' : 'AI Recipe'}
                                        </button>
                                        <button 
                                            onClick={() => toggleBasketItem(selectedFood)}
                                            className={`px-4 py-3 sm:px-6 rounded-xl border transition-all flex items-center gap-2 font-bold text-base whitespace-nowrap ${recipeBasket.includes(selectedFood) ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <span className="material-icons text-lg">{recipeBasket.includes(selectedFood) ? 'remove_shopping_cart' : 'add_shopping_cart'}</span>
                                            {recipeBasket.includes(selectedFood) ? 'Remove' : 'Add to Mix'}
                                        </button>
                                     </div>
                                     
                                     {appMode === 'foods' && (
                                         <div className="flex bg-gray-100 rounded-lg p-1.5">
                                            {(['All', 'Research', 'Book', 'Gen'] as Basis[]).map(b => (
                                                <button
                                                    key={b}
                                                    onClick={() => handleBasisChange(b)}
                                                    className={`px-4 py-2 rounded-md text-base font-bold transition-all ${basis === b ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2 space-y-4">
                                    {visibleSections.map(([name, def]) => {
                                        const hasContent = def.fields.some(field => {
                                            const val = formatData(activeFoodDetails[field.key], basis);
                                            return isValidContent(val);
                                        });

                                        if (!hasContent) return null;

                                        return (
                                            <section key={def.id} className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100">
                                                <div className={`flex items-center gap-4 mb-5 pb-4 border-b border-gray-100`}>
                                                    <div className={`p-3 rounded-xl bg-${def.tailwind} bg-opacity-10 text-${def.tailwind}`}>
                                                        <span className="material-icons text-3xl">{def.icon}</span>
                                                    </div>
                                                    <h3 className={`text-3xl font-bold text-${def.tailwind.replace('500', '800').replace('400', '700')}`}>{name}</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {def.fields.map(field => {
                                                        const content = formatData(activeFoodDetails[field.key], basis);
                                                        return renderField(field.displayName || field.key, content);
                                                    })}
                                                </div>
                                            </section>
                                        );
                                    })}
                                </div>

                                <div className="space-y-5">
                                    <div className="bg-indigo-50 rounded-3xl p-5 border border-indigo-100 sticky top-24">
                                        <h3 className="text-xl font-bold text-indigo-900 mb-5 flex items-center gap-3">
                                            <span className="material-icons text-2xl">verified</span>
                                            Suggested Ingredients
                                        </h3>
                                        {suggestedIngredients.length > 0 ? (
                                            <div className="flex flex-wrap gap-3">
                                                {suggestedIngredients.map((item, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => toggleBasketItem(item)}
                                                        className={`text-base pl-4 pr-3 py-2 rounded-full border transition-colors font-medium flex items-center gap-2 ${recipeBasket.includes(item) ? 'bg-indigo-200 border-indigo-300 text-indigo-900' : 'bg-white border-indigo-100 text-indigo-700 hover:bg-white'}`}
                                                    >
                                                        {item} 
                                                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${recipeBasket.includes(item) ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                                            {recipeBasket.includes(item) ? '✓' : '+'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-base text-indigo-500 italic">No specific maximisers found for this view.</p>
                                        )}
                                        
                                        <div className="mt-5 pt-5 border-t border-indigo-100">
                                            <p className="text-sm text-indigo-500 mb-2 uppercase font-bold tracking-wider">AI Analysis</p>
                                            <p className="text-lg text-indigo-800 leading-6 mb-5">
                                                Get a custom {appMode === 'herbs' ? 'remedy' : 'recipe'} designed to maximize bioavailability using these ingredients.
                                            </p>
                                            <button 
                                                onClick={handleGenerateRecipe}
                                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-lg shadow-md"
                                            >
                                                Generate Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ErrorBoundary>
            </main>
            
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
                <div className="relative group">
                    <div id="tamil-feedback" className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black/80 text-white text-sm py-1.5 px-3 rounded hidden whitespace-nowrap font-medium z-50">
                        Connecting...
                    </div>
                    <button
                        onClick={toggleTamil}
                        className={`w-14 h-14 rounded-full shadow-lg border border-gray-200 flex flex-col items-center justify-center transition-all ${isTamil ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        title="Translate to Tamil/English"
                    >
                        <span className="material-icons text-2xl">translate</span>
                        <span className="text-[10px] font-bold uppercase">{isTamil ? 'ENG' : 'TAM'}</span>
                    </button>
                </div>

                <button 
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${showMoreInfo ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    title={showMoreInfo ? "Show Concise Info" : "Show Full Info"}
                >
                    <span className="material-icons text-2xl">{showMoreInfo ? 'visibility' : 'visibility_off'}</span>
                </button>
            </div>

            <AILoadingModal state={aiState} onClose={() => setAiState(prev => ({ ...prev, show: false }))} />
            
            {aiRecipe && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b bg-gradient-to-r from-emerald-50 to-teal-50 flex justify-between items-start sticky top-0 z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-emerald-900">{aiRecipe.recipeName}</h2>
                                <p className="text-emerald-700 text-lg mt-1 font-medium">
                                    {appMode === 'herbs' ? '🌿 Ayurvedic Remedy Mix' : '🍽️ Holistic Chef Recipe'}
                                </p>
                            </div>
                            <button onClick={() => setAiRecipe(null)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                                <span className="material-icons text-gray-600">close</span>
                            </button>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <p className="text-gray-800 italic text-xl leading-6">{aiRecipe.description}</p>
                            
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="bg-orange-50 p-5 rounded-2xl">
                                    <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2 text-xl">
                                        <span className="material-icons text-lg">list</span> Ingredients
                                    </h3>
                                    <ul className="space-y-2">
                                        {aiRecipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-3 text-lg text-gray-800">
                                                <span className="mt-2 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                                                {ing}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="bg-blue-50 p-5 rounded-2xl">
                                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-xl">
                                        <span className="material-icons text-lg">analytics</span> Analysis
                                    </h3>
                                    <div className="space-y-2 text-lg text-gray-800">
                                        <p><strong className="text-blue-800">Benefits:</strong> {aiRecipe.nutritionalBenefits}</p>
                                        <p><strong className="text-blue-800">Ayurveda:</strong> {aiRecipe.ayurvedicInsights}</p>
                                        <p><strong className="text-blue-800">Bioactives:</strong> {aiRecipe.bioactivesSummary}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-2xl">
                                    <span className="material-icons text-emerald-600 text-3xl">restaurant_menu</span> Instructions
                                </h3>
                                <div className="space-y-4">
                                    {aiRecipe.instructions.map((step, i) => (
                                        <div key={i} className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">{i + 1}</span>
                                            <p className="text-gray-800 mt-0.5 text-lg leading-6">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                                <div className="flex items-start gap-4">
                                    <span className="material-icons text-amber-500 text-3xl">lightbulb</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-xl mb-2">{appMode === 'herbs' ? "Practitioner's Tip" : "Chef's Tip"}</h4>
                                        <p className="text-lg text-gray-700 leading-6">{aiRecipe.chefsTip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-5 border-t bg-gray-50 text-center text-sm text-gray-500">
                            AI-generated content. Verify with a professional for medical use.
                        </div>
                    </div>
                </div>
            )}

            <SearchModal 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                keyword={searchTerm}
                onKeywordChange={handleSearch}
                results={searchResults}
                onResultClick={(res) => {
                    const isHerb = ['Herbs', 'Medicinal Herbs', 'Roots', 'Leaves', 'Flowers', 'Barks', 'Resins'].includes(res.category);
                    if (isHerb && appMode !== 'herbs') setAppMode('herbs');
                    if (!isHerb && appMode !== 'foods') setAppMode('foods');
                    
                    setSelectedCategory(res.category);
                    setSelectedFood(res.food);
                    setIsSearchOpen(false);
                }}
                categories={categories}
                searchCategory={searchCategory}
                onSearchCategoryChange={setSearchCategory}
                appMode={appMode}
                onQuickGenerate={handleQuickRecipeGen}
            />

        </div>
    );
}
