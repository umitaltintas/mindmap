import React, { memo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MoreHorizontal, Edit, Trash, Plus } from 'lucide-react';
import Highlighter from 'react-highlight-words';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useMindMap } from '../context/MindMapContext';

const TreeNode = memo(({
  node,
  searchTerm,
  level = 0,
  isRoot = false,
  parentCoords = null
}) => {
  const {
    expandedNodes,
    toggleNode,
    nodeFocus,
    selectedNode,
    setSelectedNode,
    deleteNode,
    editNode,
    addChild
  } = useMindMap();

  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const nodeRef = useRef(null);
  const hasChildren = node.children?.length > 0;
  const isExpanded = hasChildren && expandedNodes.has(node.id);
  const isFocused = nodeFocus === node.id;
  const isSelected = selectedNode === node.id;

  useEffect(() => {
    if (isFocused && nodeRef.current) {
      nodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isFocused]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleNode(node.id);
    }
  };

  // Stable node animations
  const nodeMotion = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: 'easeOut' }
  };

  // Smooth children expansion
  const childrenMotion = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  };

  return (
    <motion.div
      ref={nodeRef}
      className={`
        relative transition-all duration-200
        ${isRoot ? '' : 'ml-6'}
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
        ${isFocused ? 'ring-2 ring-blue-500' : ''}
        rounded-lg
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!dropdownOpen) setDropdownOpen(false);
      }}
      {...nodeMotion}
    >
      <div
        className="group relative p-4 rounded-lg cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition-all duration-200"
        onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isExpanded}
        aria-selected={isSelected}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse button */}
          {hasChildren && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              <Highlighter
                highlightClassName="bg-yellow-200 dark:bg-yellow-700/50 rounded px-1"
                searchWords={[searchTerm]}
                autoEscape={true}
                textToHighlight={node.name || ''}
              />
            </h3>
            {node.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <Highlighter
                  highlightClassName="bg-yellow-200 dark:bg-yellow-700/50 rounded px-1"
                  searchWords={[searchTerm]}
                  autoEscape={true}
                  textToHighlight={node.description}
                />
              </p>
            )}
          </div>

          {/* Actions Menu - Always rendered but conditionally visible */}
          <div
            className={`
              flex-shrink-0 transition-opacity duration-200
              ${(isHovered || isSelected || dropdownOpen) ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <button
                  className="p-2 rounded-full transition-colors duration-200
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    active:bg-gray-300 dark:active:bg-gray-600"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1
                    border border-gray-200 dark:border-gray-700
                    animate-in fade-in-0 zoom-in-95 duration-200"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer
                      outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    onClick={() => editNode(node.id)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer
                      outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                    onClick={() => addChild(node.id)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Child
                  </DropdownMenu.Item>

                  {!isRoot && (
                    <DropdownMenu.Item
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md cursor-pointer
                        outline-none focus:bg-red-50 dark:focus:bg-red-900/30"
                      onClick={() => deleteNode(node.id)}
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>

      {/* Children nodes */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            {...childrenMotion}
            className="pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-4 mt-2"
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                searchTerm={searchTerm}
                level={level + 1}
                parentCoords={{
                  x: nodeRef.current?.offsetLeft || 0,
                  y: nodeRef.current?.offsetTop + nodeRef.current?.offsetHeight / 2 || 0
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

TreeNode.displayName = 'TreeNode';
export default TreeNode;