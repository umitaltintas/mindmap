// src/components/TreeNode.js
import React, { useState, memo } from 'react';
import { ChevronDown, ChevronRight } from 'react-feather';
import Highlighter from 'react-highlight-words';
import { motion, AnimatePresence } from 'framer-motion';
const TreeNode = memo(({ node, searchTerm, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children?.length > 0;
  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };
  const variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' }
  };
  return (
    <div className={`ml-${level > 0 ? '4' : '0'} mt-2`}>
      <motion.div
        className={`flex items-start p-2 rounded-lg cursor-pointer
                   ${hasChildren ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                   transition-colors duration-200`}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center">
          {hasChildren ? (
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            </motion.div>
          ) : (
            <span className="w-5 h-5 mr-2" />
          )}
        </div>
        
        <div className="flex-1">
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
        </div>
      </motion.div>
      {hasChildren && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4"
            >
              {node.children.map((child, index) => (
                <TreeNode
                  key={`${child.name}-${index}`}
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