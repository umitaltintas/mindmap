// src/context/MindMapContext.js

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
  } from 'react';
  import Fuse from 'fuse.js';
  import assignUniqueIds from '../utils/assignIds'; // Ensure this path is correct
  import mindMapDataOriginal from '../mindMapData.json'; // Ensure this path is correct
  
  // Create the MindMapContext
  const MindMapContext = createContext();
  
  // Define the root node's ID (we'll assign it after IDs are generated)
  let ROOT_NODE_ID = '';
  
  /**
   * Function to find the root node's ID after IDs have been assigned.
   * Assumes the root node is the first node in the data.
   * Adjust this function if your data structure differs.
   */
  const findRootNodeId = (data) => {
    return data.id; // Assuming the top-level node is the root
  };
  
  // Function to create a flattened data structure for efficient searching
  const createFlattenedData = (data) => {
    const result = [];
    const traverse = (node, path = [], depth = 0) => {
      const currentPath = [...path, node.name];
      result.push({
        id: node.id,
        name: node.name,
        description: node.description,
        path: currentPath,
        depth,
        hasChildren: Boolean(node.children?.length),
      });
  
      node.children?.forEach((child) => traverse(child, currentPath, depth + 1));
    };
    traverse(data);
    return result;
  };
  
  // Initialize Fuse.js configuration
  const FUSE_OPTIONS = {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'description', weight: 0.3 },
      { name: 'path', weight: 0.2 },
    ],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    includeMatches: true,
    ignoreLocation: true,
  };
  
  const MAX_HISTORY_STATES = 50;
  
  const SHORTCUTS = {
    SEARCH_FOCUS: { key: 'k', ctrlKey: true },
    COLLAPSE_ALL: { key: '[', ctrlKey: true },
    EXPAND_ALL: { key: ']', ctrlKey: true },
    CLEAR_SEARCH: { key: 'Escape', ctrlKey: false },
    RESET_VIEW: { key: 'r', ctrlKey: true },
    UNDO: { key: 'z', ctrlKey: true },
    REDO: { key: 'y', ctrlKey: true },
  };
  
  const MindMapProvider = ({ children }) => {
    // Assign unique IDs to the mind map data
    const [mindMapData, setMindMapData] = useState(() =>
      assignUniqueIds(mindMapDataOriginal)
    );
  
    // After assigning IDs, find the root node's ID
    useEffect(() => {
      ROOT_NODE_ID = findRootNodeId(mindMapData);
      setExpandedNodes(new Set([ROOT_NODE_ID]));
    }, [mindMapData]);
  
    // State variables
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(mindMapData);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
  
    // Refs for debouncing and search input focus
    const searchInputRef = useRef(null);
    const searchDebounceRef = useRef(null);
  
    // Function to add actions to history for undo/redo
    const addToHistory = useCallback(
      (action) => {
        setHistory((prev) => {
          const newHistory = [
            ...prev.slice(0, historyIndex + 1),
            { ...action, timestamp: Date.now() },
          ].slice(-MAX_HISTORY_STATES);
          return newHistory;
        });
        setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_STATES - 1));
      },
      [historyIndex]
    );
  
    // Function to traverse the tree and filter nodes based on search results
    const traverseTree = useCallback((node, matchedIds, parentMatched = false) => {
      const isMatched = matchedIds.has(node.id) || parentMatched;
  
      if (!isMatched && !node.children?.some((child) => matchedIds.has(child.id))) {
        return null;
      }
  
      const newNode = { ...node };
      if (node.children) {
        const filteredChildren = node.children
          .map((child) => traverseTree(child, matchedIds, isMatched))
          .filter(Boolean);
  
        if (filteredChildren.length > 0) {
          newNode.children = filteredChildren;
        } else if (!isMatched) {
          return null;
        }
      }
  
      return newNode;
    }, []);
  
    // Function to filter data based on search term
    const filterData = useCallback(
      (term) => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
  
        searchDebounceRef.current = setTimeout(() => {
          if (!term.trim()) {
            setFilteredData(mindMapData);
            return;
          }
  
          const searchResults = FUSE_INSTANCE.search(term);
          const matchedIds = new Set(searchResults.map((result) => result.item.id));
  
          // Automatically expand parent nodes of matched nodes
          const expandIds = new Set();
          searchResults.forEach((result) => {
            result.item.path.forEach((_, index) => {
              const ancestorId = FLATTENED_DATA[index]?.id;
              if (ancestorId) expandIds.add(ancestorId);
            });
          });
  
          setExpandedNodes((prev) => new Set([...prev, ...expandIds]));
          const filteredTree = traverseTree(mindMapData, matchedIds);
          setFilteredData(filteredTree || { ...mindMapData, children: [] });
        }, 150);
      },
      [traverseTree, mindMapData]
    );
  
    // Function to toggle a node's expanded/collapsed state
    const toggleNode = useCallback(
      (nodeId) => {
        // Prevent toggling the root node
        if (nodeId === ROOT_NODE_ID) return;
  
        addToHistory({
          type: 'TOGGLE_NODE',
          nodeId,
          expandedNodes: Array.from(expandedNodes),
        });
  
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          if (next.has(nodeId)) {
            next.delete(nodeId);
          } else {
            next.add(nodeId);
          }
          return next;
        });
      },
      [expandedNodes, addToHistory]
    );
  
    // Function to collapse all nodes except the root
    const collapseAll = useCallback(() => {
      addToHistory({ type: 'COLLAPSE_ALL', expandedNodes: Array.from(expandedNodes) });
      setExpandedNodes(new Set([ROOT_NODE_ID]));
    }, [expandedNodes, addToHistory]);
  
    // Function to expand all nodes
    const expandAll = useCallback(() => {
      addToHistory({ type: 'EXPAND_ALL', expandedNodes: Array.from(expandedNodes) });
      const allIds = new Set(FLATTENED_DATA.map((node) => node.id));
      allIds.add(ROOT_NODE_ID); // Ensure root node is included
      setExpandedNodes(allIds);
    }, [expandedNodes, addToHistory]);
  
    // Function to reset the view to default state
    const resetView = useCallback(() => {
      addToHistory({
        type: 'RESET_VIEW',
        searchTerm,
        expandedNodes: Array.from(expandedNodes),
      });
      setSearchTerm('');
      setFilteredData(mindMapData);
      setExpandedNodes(new Set([ROOT_NODE_ID]));
    }, [addToHistory, expandedNodes, searchTerm, mindMapData]);
  
    // Undo function
    const undo = useCallback(() => {
      if (historyIndex > 0) {
        const previousState = history[historyIndex - 1];
        setHistoryIndex((prev) => prev - 1);
        setExpandedNodes(new Set(previousState.expandedNodes));
  
        if (previousState.searchTerm !== undefined) {
          setSearchTerm(previousState.searchTerm);
          filterData(previousState.searchTerm);
        }
      }
    }, [history, historyIndex, filterData]);
  
    // Redo function
    const redo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        setHistoryIndex((prev) => prev + 1);
        setExpandedNodes(new Set(nextState.expandedNodes));
  
        if (nextState.searchTerm !== undefined) {
          setSearchTerm(nextState.searchTerm);
          filterData(nextState.searchTerm);
        }
      }
    }, [history, historyIndex, filterData]);
  
    // Memoize the flattened data
    const FLATTENED_DATA = useMemo(() => createFlattenedData(mindMapData), [mindMapData]);
  
    // Initialize Fuse.js instance with updated flattened data
    const FUSE_INSTANCE = useMemo(() => new Fuse(FLATTENED_DATA, FUSE_OPTIONS), [FLATTENED_DATA]);
  
    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(
      () => ({
        searchTerm,
        setSearchTerm,
        filteredData,
        filterData,
        expandedNodes,
        toggleNode,
        searchInputRef,
        // Control functions
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
        collapseAll,
        expandAll,
        resetView,
      }),
      [
        searchTerm,
        setSearchTerm,
        filteredData,
        filterData,
        expandedNodes,
        toggleNode,
        undo,
        redo,
        collapseAll,
        expandAll,
        resetView,
      ]
    );
  
    // Keyboard shortcuts handling
    useEffect(() => {
      const handleKeyDown = (event) => {
        // Ignore key presses within input fields, except for Escape
        if (event.target.tagName === 'INPUT' && event.key !== 'Escape') {
          return;
        }
  
        const shortcut = Object.entries(SHORTCUTS).find(
          ([, config]) =>
            event.key === config.key && event.ctrlKey === config.ctrlKey
        );
  
        if (shortcut) {
          event.preventDefault();
          const [action] = shortcut;
  
          switch (action) {
            case 'SEARCH_FOCUS':
              searchInputRef.current?.focus();
              break;
            case 'COLLAPSE_ALL':
              collapseAll();
              break;
            case 'EXPAND_ALL':
              expandAll();
              break;
            case 'CLEAR_SEARCH':
              if (searchTerm) {
                setSearchTerm('');
                filterData('');
              }
              break;
            case 'RESET_VIEW':
              resetView();
              break;
            case 'UNDO':
              undo();
              break;
            case 'REDO':
              redo();
              break;
            default:
              break;
          }
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
      collapseAll,
      expandAll,
      filterData,
      resetView,
      searchTerm,
      undo,
      redo,
    ]);
  
    return (
      <MindMapContext.Provider value={contextValue}>
        {children}
      </MindMapContext.Provider>
    );
  };
  
  // Custom hook to use the MindMapContext
  export const useMindMap = () => {
    const context = useContext(MindMapContext);
    if (!context) {
      throw new Error('useMindMap must be used within a MindMapProvider');
    }
    return context;
  };
  
  export { MindMapProvider };
  