// src/components/SearchBar.js
import React, { useCallback } from 'react';
import { Search } from 'react-feather';
import { useMindMap } from '../context/MindMapContext';
import debounce from 'lodash.debounce';
const SearchBar = () => {
  const { searchTerm, setSearchTerm, filterData } = useMindMap();
  const debouncedFilter = useCallback(
    debounce((term) => filterData(term), 300),
    [filterData]
  );
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedFilter(term);
  };
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Konuları ara..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 placeholder-gray-400 dark:placeholder-gray-300
                 transition duration-200"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );
};
export default SearchBar;