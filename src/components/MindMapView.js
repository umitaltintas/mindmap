
// src/components/MindMapView.js
import React from 'react';
import { Moon, Sun } from 'react-feather';
import { useMindMap } from '../context/MindMapContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from './SearchBar';
import TreeNode from './TreeNode';
const MindMapView = () => {
    const { filteredData, searchTerm } = useMindMap();
    const { isDarkMode, toggleDarkMode } = useTheme();
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <SearchBar />
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors duration-200"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? (
                        <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>
            <TreeNode node={filteredData} searchTerm={searchTerm} />
        </div>
    );
};
export default MindMapView;