import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import mindMapData from '../mindMapData.json';

const MindMapContext = createContext();

const SHORTCUTS = {
  SEARCH_FOCUS: { key: 'f', ctrlKey: true },
  COLLAPSE_ALL: { key: '[', ctrlKey: true },
  EXPAND_ALL: { key: ']', ctrlKey: true },
  CLEAR_SEARCH: { key: 'Escape', ctrlKey: false },
  RESET_VIEW: { key: 'r', ctrlKey: true },
};

// Pre-compute flattened data outside component
const getFlattenedData = () => {
  const flattenNodes = (node, path = [], ancestors = []) => {
    const currentPath = [...path, node.name];
    const flatNode = {
      ...node,
      path: currentPath,
      ancestors,
      fullPath: currentPath.join(' > '),
    };

    const results = [flatNode];

    if (node.children) {
      node.children.forEach(child => {
        results.push(...flattenNodes(child, currentPath, [...ancestors, node]));
      });
    }

    return results;
  };

  return flattenNodes(mindMapData);
};

const FLATTENED_DATA = getFlattenedData();

// Pre-initialize Fuse instance
const FUSE_INSTANCE = new Fuse(FLATTENED_DATA, {
  keys: ['name', 'description', 'fullPath'],
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
});

export const MindMapProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(mindMapData);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Use useRef instead of state for searchInputRef
  const searchInputRef = useRef(null);

  // Memoize history-dependent values
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex]);
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex, history.length]);

  // Debounced search function
  const debouncedSearch = useRef(null);
  
  // Memoize tree rebuilding function
  const rebuildTree = useCallback((originalNode, matchedPaths, matchInfo = {}) => {
    const isNodeMatched = matchedPaths.some(path => 
      path.includes(originalNode.name)
    );

    if (!isNodeMatched && !matchInfo[originalNode.id]) {
      return null;
    }

    if (isNodeMatched) {
      setExpandedNodes(prev => new Set([...prev, originalNode.id]));
    }

    const newNode = { ...originalNode };

    if (originalNode.children) {
      const filteredChildren = originalNode.children
        .map(child => rebuildTree(child, matchedPaths, matchInfo))
        .filter(Boolean);

      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
      }
    }

    return newNode;
  }, []);

  // Optimized addToHistory with batch updates
  const addToHistory = useCallback((action) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), action];
      return newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Memoized undo/redo functions
  const undo = useCallback(() => {
    if (canUndo) {
      const previousState = history[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      
      if (previousState.expandedNodes) {
        setExpandedNodes(new Set(previousState.expandedNodes));
      }
      if (previousState.searchTerm !== undefined) {
        setSearchTerm(previousState.searchTerm);
      }
    }
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      
      if (nextState.expandedNodes) {
        setExpandedNodes(new Set(nextState.expandedNodes));
      }
      if (nextState.searchTerm !== undefined) {
        setSearchTerm(nextState.searchTerm);
      }
    }
  }, [canRedo, history, historyIndex]);

  // Optimized node expansion functions
  const collapseAll = useCallback(() => {
    addToHistory({ expandedNodes: Array.from(expandedNodes) });
    setExpandedNodes(new Set());
  }, [expandedNodes, addToHistory]);

  const expandAll = useCallback(() => {
    const getAllNodeIds = (node) => {
      let ids = [node.id];
      if (node.children) {
        node.children.forEach(child => {
          ids.push(...getAllNodeIds(child));
        });
      }
      return ids;
    };

    addToHistory({ expandedNodes: Array.from(expandedNodes) });
    setExpandedNodes(new Set(getAllNodeIds(mindMapData)));
  }, [expandedNodes, addToHistory]);

  const toggleNode = useCallback((nodeId) => {
    addToHistory({ expandedNodes: Array.from(expandedNodes) });
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  }, [expandedNodes, addToHistory]);

  // Optimized search with debouncing
  const filterData = useCallback((term) => {
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }

    debouncedSearch.current = setTimeout(() => {
      addToHistory({ searchTerm });
      setSearchTerm(term);

      if (!term.trim()) {
        setFilteredData(mindMapData);
        return;
      }

      const searchResults = FUSE_INSTANCE.search(term);
      const matchedPaths = searchResults.map(result => result.item.path);
      const matchInfo = Object.fromEntries(
        searchResults.flatMap(result => 
          result.item.ancestors.map(ancestor => [ancestor.id, true])
        )
      );

      const filteredTree = rebuildTree(mindMapData, matchedPaths, matchInfo);
      setFilteredData(filteredTree || { ...mindMapData, children: [] });
    }, 150); // 150ms debounce delay
  }, [addToHistory, rebuildTree]);

  // Optimized reset view
  const resetView = useCallback(() => {
    addToHistory({
      searchTerm,
      expandedNodes: Array.from(expandedNodes)
    });
    setSearchTerm('');
    setFilteredData(mindMapData);
    setExpandedNodes(new Set());
  }, [searchTerm, expandedNodes, addToHistory]);

  // Optimized keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        if (event.key === SHORTCUTS.CLEAR_SEARCH.key && !SHORTCUTS.CLEAR_SEARCH.ctrlKey) {
          if (event.target === searchInputRef.current) {
            setSearchTerm('');
            filterData('');
          }
        }
        return;
      }

      if (event.ctrlKey) {
        switch (event.key) {
          case SHORTCUTS.SEARCH_FOCUS.key:
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case SHORTCUTS.COLLAPSE_ALL.key:
            event.preventDefault();
            collapseAll();
            break;
          case SHORTCUTS.EXPAND_ALL.key:
            event.preventDefault();
            expandAll();
            break;
          case SHORTCUTS.RESET_VIEW.key:
            event.preventDefault();
            resetView();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapseAll, expandAll, resetView, filterData]);

  // Memoized context value
  const value = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    filteredData,
    filterData,
    expandedNodes,
    setExpandedNodes,
    collapseAll,
    expandAll,
    resetView,
    toggleNode,
    undo,
    redo,
    exportData: () => {
      const dataStr = JSON.stringify(mindMapData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mindmap-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    importData: (jsonData) => {
      try {
        const newData = JSON.parse(jsonData);
        setFilteredData(newData);
        setExpandedNodes(new Set());
        addToHistory({ importedData: true });
      } catch (error) {
        console.error('Error importing data:', error);
      }
    },
    searchInputRef,
    canUndo,
    canRedo,
  }), [
    searchTerm,
    filteredData,
    expandedNodes,
    collapseAll,
    expandAll,
    resetView,
    toggleNode,
    undo,
    redo,
    addToHistory,
    canUndo,
    canRedo
  ]);

  return (
    <MindMapContext.Provider value={value}>
      {children}
    </MindMapContext.Provider>
  );
};

export const useMindMap = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
};