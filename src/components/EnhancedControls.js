import React from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, 
  Download, Share, 
  Camera, Settings,
  FileJson, FilePdf
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMindMap } from '../context/MindMapContext';

export const EnhancedControls = () => {
  const { 
    handleZoom,
    zoomLevel,
    exportMindMap,
    takeScreenshot,
    shareMindMap 
  } = useMindMap();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 flex flex-col gap-2"
    >
      {/* Export Menu */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg
                           hover:shadow-xl transition-shadow duration-200
                           text-gray-700 dark:text-gray-300">
            <Download className="w-5 h-5" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2
                     border border-gray-200 dark:border-gray-700 min-w-[180px]"
            sideOffset={5}
            align="end"
          >
            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100
                       dark:hover:bg-gray-700 rounded-md cursor-pointer"
              onClick={exportMindMap}
            >
              <FileJson className="w-4 h-4" />
              Export as JSON
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100
                       dark:hover:bg-gray-700 rounded-md cursor-pointer"
              onClick={takeScreenshot}
            >
              <Camera className="w-4 h-4" />
              Save as Image
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="my-1 border-t border-gray-200 dark:border-gray-700" />

            <DropdownMenu.Item
              className="flex items-center gap-2 px-3 py-2 text-sm
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100
                       dark:hover:bg-gray-700 rounded-md cursor-pointer"
              onClick={shareMindMap}
            >
              <Share className="w-4 h-4" />
              Share Mind Map
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/* Zoom Controls */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1)}
          disabled={zoomLevel >= 2}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg
                   hover:shadow-xl transition-shadow duration-200
                   text-gray-700 dark:text-gray-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          disabled={zoomLevel <= 0.5}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg
                   hover:shadow-xl transition-shadow duration-200
                   text-gray-700 dark:text-gray-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Settings */}
      <button
        onClick={() => {/* Implement settings modal */}}
        className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg
                 hover:shadow-xl transition-shadow duration-200
                 text-gray-700 dark:text-gray-300"
      >
        <Settings className="w-5 h-5" />
      </button>
    </motion.div>
  );
};