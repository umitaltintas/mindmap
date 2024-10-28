import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useMindMap } from '../context/MindMapContext';
import * as Command from '@radix-ui/react-command';
import debounce from 'lodash.debounce';

const SearchBar = () => {
  const {
    searchTerm,
    setSearchTerm,
    filterData,
    focusNode,
    searchResults,
    setSearchResults
  } = useMindMap();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const debouncedSearch = useRef(
    debounce((term) => {
      filterData(term);
    }, 200)
  ).current;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
    debouncedSearch('');
  };

  const handleResultClick = (nodeId) => {
    focusNode(nodeId);
    setIsOpen(false);
  };

  const handleKeyNavigation = (e) => {
    if (!searchResults.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => prev > 0 ? prev - 1 : 0);
    }
    else if (e.key === 'Enter') {
      e.preventDefault();
      handleResultClick(searchResults[selectedIndex].item.id);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                          text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search mind map... (Ctrl + K)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyNavigation}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 
                     border border-gray-300 dark:border-gray-600 rounded-lg
                     text-gray-900 dark:text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition duration-200"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 
                       rounded-lg shadow-lg border border-gray-200 
                       dark:border-gray-700 max-h-96 overflow-y-auto"
          >
            <Command.List className="p-2">
              {searchResults.map((result, index) => (
                <Command.Item
                  key={result.item.id}
                  onSelect={() => handleResultClick(result.item.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-sm
                    ${index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    cursor-pointer transition-colors
                  `}
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.item.name}</div>
                    {result.item.path.length > 1 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {result.item.path.slice(0, -1).join(' > ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Jump to</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Command.Item>
              ))}
            </Command.List>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;