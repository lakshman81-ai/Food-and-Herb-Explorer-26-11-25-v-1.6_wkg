
import React from 'react';
import type { SearchResult, SearchModalProps } from '../types';

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, keyword, onKeywordChange, results, onResultClick, categories, searchCategory, onSearchCategoryChange, appMode, onQuickGenerate }) => {
  if (!isOpen) {
    return null;
  }

  const isHerbCategory = ['Herbs', 'Spices', 'Medicinal Herbs', 'Roots', 'Leaves', 'Flowers', 'Barks', 'Resins'].some(c => searchCategory.includes(c));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-0 sm:pt-0 mt-2 z-[1000]" onClick={onClose}>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-2xl w-11/12 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Search Food Matrix</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                    <i className="material-icons text-gray-600">close</i>
                </button>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <i className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</i>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            placeholder={`Search (e.g., ${appMode === 'herbs' ? 'cold, inflammation' : 'metabolic, dopamine'})`}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                            autoFocus
                        />
                    </div>
                    <div className="relative flex-shrink-0">
                        <select
                            value={searchCategory}
                            onChange={(e) => onSearchCategoryChange(e.target.value)}
                            className="w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white text-base"
                            aria-label="Filter by category"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <i className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">arrow_drop_down</i>
                    </div>
                </div>
                
                {/* Quick Generator Button - Only visible for Herb categories */}
                {keyword.length > 2 && isHerbCategory && (
                    <button 
                        onClick={() => onQuickGenerate(keyword)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                    >
                        <span className="material-icons text-yellow-300">bolt</span>
                        Generate Quick Remedy for "{keyword}"
                    </button>
                )}
            </div>
        </div>
        
        <div className="mt-4 flex-grow overflow-y-auto pr-2">
            {keyword.length > 1 && results.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-lg">
                    <p>No results found for "{keyword}".</p>
                </div>
            )}
            {results.length > 0 && (
                <ul className="space-y-3">
                    {results.map((result) => (
                        <li key={result.food}>
                            <button
                                onClick={() => onResultClick(result)}
                                className="w-full text-left p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                <h3 className="font-bold text-indigo-700 text-lg">{result.food}</h3>
                                <div className="text-sm text-gray-600 mt-2 space-y-1.5">
                                    {result.matches.map((match, index) => (
                                        <div key={index} className="flex items-start">
                                            <span className="font-semibold w-24 flex-shrink-0">{match.section}:</span>
                                            <span className="ml-2 italic text-gray-500" dangerouslySetInnerHTML={{ __html: match.snippet }} />
                                        </div>
                                    ))}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
             {keyword.length <= 1 && (
                <div className="text-center py-8 text-gray-400 text-lg">
                    <p>Please enter at least 2 characters to search.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
