// src/components/MindMapControls.js
import React from 'react';
import { Moon, Sun, ChevronDown, ChevronRight, RefreshCcw } from 'react-feather';
import { useTheme } from '../context/ThemeContext';
import { useMindMap } from '../context/MindMapContext';

const MindMapControls = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { collapseAll, expandAll, resetView } = useMindMap();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={collapseAll}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors duration-200 flex items-center"
        title="Tümünü Daralt"
      >
        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <button
        onClick={expandAll}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors duration-200 flex items-center"
        title="Tümünü Genişlet"
      >
        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <button
        onClick={resetView}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors duration-200 flex items-center"
        title="Görünümü Sıfırla"
      >
        <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600
                   transition-colors duration-200"
        title={isDarkMode ? "Açık Mod" : "Koyu Mod"}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
};

export default MindMapControls;