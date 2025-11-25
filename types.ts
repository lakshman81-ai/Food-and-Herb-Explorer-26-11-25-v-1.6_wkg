
export interface FieldDefinition {
  key: string;
  displayName: string | null;
}

export interface SectionDefinition {
  id: string;
  icon: string;
  color: string;
  tailwind: string;
  fields: FieldDefinition[];
  isConditional?: boolean;
}

export interface FoodDetails {
  [csvHeader: string]: {
    [basis: string]: string;
  };
  _imageUrl?: { [basis: string]: string };
}

export interface FoodData {
  [category: string]: {
    [food: string]: FoodDetails;
  };
}

export type Basis = 'All' | 'Research' | 'Book' | 'Gen';

export interface AILoadingState {
  show: boolean;
  message: string;
  showSpinner: boolean;
  showClose: boolean;
}

export interface StructuredRecipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  chefsTip?: string;
  nutritionalBenefits: string;
  ayurvedicInsights: string;
  estimatedMacros: string;
  estimatedMicros: string;
  bioactivesSummary: string;
  notes?: string;
}

export interface SearchMatch {
  section: string;
  snippet: string;
}

export interface SearchResult {
  food: string;
  category: string;
  matches: SearchMatch[];
}

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  categories: string[];
  searchCategory: string;
  onSearchCategoryChange: (category: string) => void;
  appMode: 'foods' | 'herbs';
  onQuickGenerate: (term: string) => void;
}
