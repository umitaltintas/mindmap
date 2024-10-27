// src/components/TreeNode.js

import React, { memo } from 'react';
import { ChevronRight } from 'react-feather';
import Highlighter from 'react-highlight-words';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../context/MindMapContext';
import classNames from 'classnames';

const TreeNode = memo(({ node, searchTerm, level = 0, isRoot = false }) => {
  const { expandedNodes, toggleNode } = useMindMap();
  const hasChildren = node.children?.length > 0;
  const isExpanded = hasChildren && expandedNodes.has(node.id);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (hasChildren) {
      toggleNode(node.id);
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
    // Optional: Implement any specific behavior when the content is clicked
  };

  const variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.2,
      },
    },
  };

  // Define indentation based on the level
  const indentationClass = classNames({
    'mt-2': true,
    'ml-0': level === 0,
    'ml-4': level === 1,
    'ml-8': level === 2,
    'ml-12': level >= 3, // Adjust as needed for deeper levels
  });

  return (
    <div className={indentationClass}>
      <div
        className="flex items-start p-2 rounded-lg transition-colors duration-200 group cursor-pointer"
        onClick={handleToggle} // Toggle when clicking the node
      >
        {/* Expand/Collapse Button */}
        {hasChildren && !isRoot && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </motion.div>
          </button>
        )}

        {/* Content Area */}
        <div className="flex-1 ml-2" onClick={handleContentClick}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="p-1"
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              <Highlighter
                highlightClassName="bg-yellow-200 dark:bg-yellow-700 rounded px-1"
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={node.name || ''}
              />
            </h2>
            {node.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <Highlighter
                  highlightClassName="bg-yellow-200 dark:bg-yellow-700 rounded px-1"
                  searchWords={[searchTerm]}
                  autoEscape={true}
                  textToHighlight={node.description}
                />
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="pl-4 border-l-2 border-gray-200 dark:border-gray-600"
            >
              {node.children.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  searchTerm={searchTerm}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';
export default TreeNode;
