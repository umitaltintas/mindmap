import React, { memo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useInView } from 'react-intersection-observer';
import Highlighter from 'react-highlight-words';
import { useMindMap } from '../context/MindMapContext';
import { useToast } from '../context/ToastContext';
const OptimizedTreeNode = memo(({
  node,
  searchTerm,
  level = 0,
  isRoot = false
}) => {
  const {
    expandedNodes,
    toggleNode,
    selectedNode,
    setSelectedNode,
    nodeFocus
  } = useMindMap();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const nodeRef = useRef(null);

  // Intersection Observer for lazy loading
  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  });

  // Merge refs
  const setRefs = (element) => {
    nodeRef.current = element;
    inViewRef(element);
  };

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


  const handleToggle = async () => {
    if (!hasChildren) return;

    setIsLoading(true);
    try {
      await toggleNode(node.id);
      if (!isExpanded) {
        addToast('Node expanded successfully', 'success');
      }
    } catch (error) {
      addToast('Failed to toggle node', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ARIA labels for accessibility
  const ariaLabel = `${node.name}${hasChildren ? ', has children' : ''}${isExpanded ? ', expanded' : ''}`;

  if (!inView) {
    return <div ref={inViewRef} style={{ height: '50px' }} />;
  }

  return (
    <motion.div
      ref={setRefs}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        relative transition-all duration-200
        ${isRoot ? '' : 'ml-6'}
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
        ${isFocused ? 'ring-2 ring-blue-500' : ''}
        rounded-lg
      `}
      role="treeitem"
      aria-expanded={isExpanded}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleToggle();
        }
      }}
    >
      <div
        className="group relative p-4 rounded-lg hover:bg-gray-50 
                   dark:hover:bg-gray-800 transition-all duration-200"
        onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
        role="button"
        aria-pressed={isSelected}
      >
        <div className="flex items-center gap-3">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              disabled={isLoading}
              className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 
                       dark:hover:bg-gray-700 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-blue-500 
                                border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
              </motion.div>
            </button>
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

          <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-2 rounded-full opacity-0 group-hover:opacity-100 
                         transition-opacity duration-200 hover:bg-gray-200 
                         dark:hover:bg-gray-700"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </DropdownMenu.Trigger>
            {/* Dropdown menu content */}
          </DropdownMenu.Root>
        </div>
      </div>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-4 mt-2"
          >
            {node.children.map((child) => (
              <OptimizedTreeNode
                key={child.id}
                node={child}
                searchTerm={searchTerm}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

OptimizedTreeNode.displayName = 'OptimizedTreeNode';
export default OptimizedTreeNode;