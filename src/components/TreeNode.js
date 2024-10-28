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
    zoomLevel,
    isDragging,
    deleteNode,
    editNode,
    addChild
  } = useMindMap();

  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
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

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const nodeMotion = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
  };

  const childrenMotion = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleNode(node.id);
    }
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
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
      {...nodeMotion}
    >
      {parentCoords && (
        <svg className="absolute pointer-events-none" style={{
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: -1
        }}>
          <motion.path
            d={`M ${parentCoords.x} ${parentCoords.y} C ${parentCoords.x + 100} ${parentCoords.y}, 
                ${nodeRef.current?.offsetLeft - 100} ${nodeRef.current?.offsetTop + nodeRef.current?.offsetHeight / 2}, 
                ${nodeRef.current?.offsetLeft} ${nodeRef.current?.offsetTop + nodeRef.current?.offsetHeight / 2}`}
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className={`text-gray-300 dark:text-gray-600 ${isSelected ? 'stroke-dasharray-2' : ''}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      )}

      <div
        className={`
          group p-4 rounded-lg cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition-all duration-200
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
        onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
        onKeyDown={handleKeyPress}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isExpanded}
        aria-selected={isSelected}
      >
        <div className="flex items-center gap-3">
          {hasChildren && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}

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

          <AnimatePresence>
            {(isHovered || isSelected) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700
                                   focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      className="min-w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1
                               border border-gray-200 dark:border-gray-700"
                      sideOffset={5}
                    >
                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                        onClick={() => editNode(node.id)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                        onClick={() => addChild(node.id)}
                      >
                        <Plus className="w-4 h-4" />
                        Add Child
                      </DropdownMenu.Item>

                      {!isRoot && (
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400
                                   hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md cursor-pointer"
                          onClick={() => deleteNode(node.id)}
                        >
                          <Trash className="w-4 h-4" />
                          Delete
                        </DropdownMenu.Item>
                      )}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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