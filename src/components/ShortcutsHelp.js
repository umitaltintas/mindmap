import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const ShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Quick search' },
    { keys: ['↑', '↓'], description: 'Navigate between nodes' },
    { keys: ['←', '→'], description: 'Collapse/Expand nodes' },
    { keys: ['Ctrl', '['], description: 'Collapse all' },
    { keys: ['Ctrl', ']'], description: 'Expand all' },
    { keys: ['Ctrl', 'M'], description: 'Toggle mini map' },
    { keys: ['Ctrl', '+'], description: 'Zoom in' },
    { keys: ['Ctrl', '-'], description: 'Zoom out' },
    { keys: ['Enter'], description: 'Toggle selected node' },
    { keys: ['Esc'], description: 'Clear selection' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo' }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-3 bg-white dark:bg-gray-800 
                   rounded-full shadow-lg hover:shadow-xl transition-shadow
                   text-gray-700 dark:text-gray-300"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                   w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex items-center gap-2">
                    {shortcut.keys.map((key, keyIndex) => (
                      <kbd
                        key={keyIndex}
                        className="px-2 py-1 text-sm font-semibold bg-gray-100 
                                 dark:bg-gray-700 rounded border border-gray-200 
                                 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Tip: Press <kbd className="px-1 py-0.5 rounded bg-gray-100 
                       dark:bg-gray-700">?</kbd> anytime to show this dialog
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default ShortcutsHelp;