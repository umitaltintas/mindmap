// src/App.js

import React from 'react';
import { MindMapProvider } from './context/MindMapContext';
import MindMapView from './components/MindMapView';
import ScrollToTopButton from './components/ScrollToTopButton';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MindMapProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex justify-center items-start p-4 sm:p-10">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 w-full max-w-5xl">
              <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
                Makroekonomi Mindmap
              </h1>
              <MindMapView />
            </div>
          </div>
          <ScrollToTopButton />
        </MindMapProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
