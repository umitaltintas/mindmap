// src/App.js
import React, { Suspense } from 'react';
import AppProviders from './context/AppProviders';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import KeyboardNavigation from './components/KeyboardNavigation';
import OnboardingTour from './components/OnboardingTour';
import ShortcutsHelp from './components/ShortcutsHelp';
import MobileControls from './components/MobileControls';
import MindMapView from './components/MindMapView';
import ScrollToTopButton from './components/ScrollToTopButton';
import LoadingOverlay from './components/LoadingOverlay';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <KeyboardNavigation />
        <OnboardingTour />
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <Header />
          <main id="main-content" className="pt-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={<LoadingOverlay />}>
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 min-h-[calc(100vh-8rem)]">
                  <MindMapView />
                </div>
              </Suspense>
            </div>
          </main>
          <Suspense fallback={null}>
            <ScrollToTopButton />
          </Suspense>
          <MobileControls />
          <ShortcutsHelp />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                     bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Skip to main content
          </a>
          <div
            aria-live="polite"
            className="fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-gray-800 
                     border-t border-gray-200 dark:border-gray-700 px-4 py-1 text-sm
                     text-gray-600 dark:text-gray-400 hidden md:block"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <span>
                Press <kbd className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">?</kbd> for keyboard shortcuts
              </span>
              <span>
                Press <kbd className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">Esc</kbd> to clear selection
              </span>
            </div>
          </div>
        </div>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default React.memo(App);
