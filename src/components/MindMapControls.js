import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, ZoomIn, ZoomOut, 
  Map, Download, Share, Camera,
  Maximize2, Minimize2, RotateCcw,
  ChevronDown, ChevronRight, Settings
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '../context/ThemeContext';
import { useMindMap } from '../context/MindMapContext';

const MindMapControls = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const {
    collapseAll,
    expandAll,
    resetView,
    zoomLevel,
    handleZoom,
    showMiniMap,
    setShowMiniMap,
    exportMindMap,
    takeScreenshot,
    shareMindMap,
    canUndo,
    canRedo,
    undo,
    redo
  } = useMindMap();

  const [showSettings, setShowSettings] = useState(false);

  const ControlButton = ({ icon: Icon, label, onClick, disabled }) => (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={disabled}
            className={`
              p-2 rounded-lg bg-white dark:bg-gray-800 
              shadow-sm hover:shadow-md
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`} />
          </motion.button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm"
            sideOffset={5}
          >
            {label}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 p-2 bg-white/80 dark:bg-gray-800/80 
                   backdrop-blur-lg rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-2">
          <ControlButton
            icon={ChevronDown}
            label="Collapse All (Ctrl + [)"
            onClick={collapseAll}
          />
          <ControlButton
            icon={ChevronRight}
            label="Expand All (Ctrl + ])"
            onClick={expandAll}
          />
        </div>

        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-2">
          <ControlButton
            icon={ZoomOut}
            label="Zoom Out (Ctrl + -)"
            onClick={() => handleZoom(-1)}
            disabled={zoomLevel <= 0.5}
          />
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </div>
          <ControlButton
            icon={ZoomIn}
            label="Zoom In (Ctrl + +)"
            onClick={() => handleZoom(1)}
            disabled={zoomLevel >= 2}
          />
        </div>

        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-2">
          <ControlButton
            icon={Map}
            label="Toggle Mini Map (Ctrl + M)"
            onClick={() => setShowMiniMap(!showMiniMap)}
          />
          <ControlButton
            icon={showMiniMap ? Minimize2 : Maximize2}
            label="Reset View (Ctrl + R)"
            onClick={resetView}
          />
        </div>

        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-2">
          <ControlButton
            icon={RotateCcw}
            label="Undo (Ctrl + Z)"
            onClick={undo}
            disabled={!canUndo}
          />
          <ControlButton
            icon={RotateCcw}
            label="Redo (Ctrl + Y)"
            onClick={redo}
            disabled={!canRedo}
            className="rotate-180"
          />
        </div>

        <div className="flex items-center gap-2">
          <ControlButton
            icon={Camera}
            label="Take Screenshot (Ctrl + Shift + S)"
            onClick={takeScreenshot}
          />
          <ControlButton
            icon={Download}
            label="Export Mind Map"
            onClick={exportMindMap}
          />
          <ControlButton
            icon={Share}
            label="Share Mind Map"
            onClick={shareMindMap}
          />
        </div>

        <div className="border-l border-gray-200 dark:border-gray-700 pl-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 
                         shadow-sm hover:shadow-md transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2
                         border border-gray-200 dark:border-gray-700"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex items-center justify-between px-3 py-2 text-sm
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100
                           dark:hover:bg-gray-700 rounded-md cursor-pointer"
                  onClick={toggleDarkMode}
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? (
                      <>
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </>
                    )}
                  </span>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 border-t border-gray-200 dark:border-gray-700" />

                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-2 text-sm
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100
                           dark:hover:bg-gray-700 rounded-md cursor-pointer"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </motion.div>
    </div>
  );
};

export default MindMapControls;