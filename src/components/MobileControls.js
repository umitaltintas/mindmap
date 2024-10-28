import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ZoomIn, ZoomOut, RefreshCw, 
  ChevronDown, ChevronRight, Search 
} from 'lucide-react';
import { useMindMap } from '../context/MindMapContext';

const MobileControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    handleZoom,
    zoomLevel,
    collapseAll,
    expandAll,
    resetView,
    searchInputRef
  } = useMindMap();

  const controls = [
    {
      icon: Search,
      label: 'Search',
      action: () => {
        searchInputRef.current?.focus();
        setIsOpen(false);
      }
    },
    {
      icon: ZoomIn,
      label: 'Zoom In',
      action: () => handleZoom(1),
      disabled: zoomLevel >= 2
    },
    {
      icon: ZoomOut,
      label: 'Zoom Out',
      action: () => handleZoom(-1),
      disabled: zoomLevel <= 0.5
    },
    {
      icon: ChevronDown,
      label: 'Collapse All',
      action: collapseAll
    },
    {
      icon: ChevronRight,
      label: 'Expand All',
      action: expandAll
    },
    {
      icon: RefreshCw,
      label: 'Reset View',
      action: resetView
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white 
                   rounded-full shadow-lg md:hidden z-50"
        aria-label="Open controls"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 
                     rounded-t-xl shadow-lg p-4 z-50 md:hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Controls
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 
                         dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {controls.map((control, index) => {
                const Icon = control.icon;
                return (
                  <button
                    key={index}
                    onClick={control.action}
                    disabled={control.disabled}
                    className="flex flex-col items-center gap-2 p-4 
                             bg-gray-50 dark:bg-gray-700 rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {control.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Touch hint */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Tip: Pinch to zoom, swipe to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileControls;