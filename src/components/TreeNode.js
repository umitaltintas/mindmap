// src/components/TreeNode.js
import React, { memo } from 'react';
import { ChevronRight } from 'react-feather';
import Highlighter from 'react-highlight-words';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../context/MindMapContext';

const TreeNode = memo(({ node, searchTerm, level = 0 }) => {
  const { expandedNodes, toggleNode } = useMindMap();
  const hasChildren = node.children?.length > 0;
  const isExpanded = hasChildren && expandedNodes.has(node.id);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (hasChildren) {
      toggleNode(node.id);
    }
  };

  // Separate handler for the content area to prevent collapse on description click
  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent node's click handler
  };

  const variants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`ml-${level > 0 ? '4' : '0'} mt-2`}>
      <div className="flex items-start p-2 rounded-lg transition-colors duration-200 group">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
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
        <div 
          className="flex-1 ml-2 cursor-default"
          onClick={handleContentClick}
        >
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
              className="ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4"
            >
              {node.children.map((child, index) => (
                <TreeNode
                  key={child.id || `${child.name}-${index}`}
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