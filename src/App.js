import React, { Suspense } from 'react';
import { MindMapProvider } from './context/MindMapContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import KeyboardNavigation from './components/KeyboardNavigation';
import OnboardingTour from './components/OnboardingTour';
import ShortcutsHelp from './components/ShortcutsHelp';
import MobileControls from './components/MobileControls';

// Lazy load components that aren't needed immediately
const MindMapView = React.lazy(() => import('./components/MindMapView'));
const ScrollToTopButton = React.lazy(() => import('./components/ScrollToTopButton'));

// Loading component for suspense fallback
const LoadingOverlay = () => (
  <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading Mind Map...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <MindMapProvider>
            {/* Keyboard navigation handler */}
            <KeyboardNavigation />

            {/* First time user onboarding */}
            <OnboardingTour />

            {/* Main application wrapper */}
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {/* Header */}
              <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-40 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Makroekonomi Mindmap
                  </h1>

                  <div className="flex items-center gap-4">
                    {/* Theme toggle and other header controls can go here */}
                  </div>
                </div>
              </header>

              {/* Main content */}
              <main className="pt-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <Suspense fallback={<LoadingOverlay />}>
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 min-h-[calc(100vh-8rem)]">
                      <MindMapView />
                    </div>
                  </Suspense>
                </div>
              </main>

              {/* Floating UI Elements */}
              <Suspense fallback={null}>
                <ScrollToTopButton />
              </Suspense>

              {/* Mobile-friendly controls */}
              <MobileControls />

              {/* Keyboard shortcuts help */}
              <ShortcutsHelp />

              {/* Accessibility skip link */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                         bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Skip to main content
              </a>
            </div>

            {/* Status bar for keyboard mode indicator */}
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
          </MindMapProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Wrap the export with React.memo for performance
export default React.memo(App);