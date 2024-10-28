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
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import assignUniqueIds from '../utils/assignIds';
import mindMapDataOriginal from '../resources/mindMapData.json';

// Create the MindMapContext
const MindMapContext = createContext();

// Define the root node's ID
let ROOT_NODE_ID = '';

// Constants
const MAX_HISTORY_STATES = 50;
const MAX_ZOOM = 2;
const MIN_ZOOM = 0.5;
const ZOOM_STEP = 0.1;

const SHORTCUTS = {
  SEARCH_FOCUS: { key: 'k', ctrlKey: true },
  COLLAPSE_ALL: { key: '[', ctrlKey: true },
  EXPAND_ALL: { key: ']', ctrlKey: true },
  CLEAR_SEARCH: { key: 'Escape', ctrlKey: false },
  RESET_VIEW: { key: 'r', ctrlKey: true },
  UNDO: { key: 'z', ctrlKey: true },
  REDO: { key: 'y', ctrlKey: true },
  ZOOM_IN: { key: '=', ctrlKey: true },
  ZOOM_OUT: { key: '-', ctrlKey: true },
  TOGGLE_MINIMAP: { key: 'm', ctrlKey: true },
  TAKE_SCREENSHOT: { key: 's', ctrlKey: true, shiftKey: true },
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

const MindMapProvider = ({ children }) => {
  // Core state
  const [mindMapData, setMindMapData] = useState(() =>
    assignUniqueIds(mindMapDataOriginal)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(mindMapData);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // New features state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeFocus, setNodeFocus] = useState(null);

  // Refs
  const mindMapRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const dragStartRef = useRef(null);
  const viewStartRef = useRef(null);

  // Initialize root node ID
  useEffect(() => {
    ROOT_NODE_ID = mindMapData.id;
    setExpandedNodes(new Set([ROOT_NODE_ID]));
  }, [mindMapData]);

  // Memoized values
  const FLATTENED_DATA = useMemo(() => createFlattenedData(mindMapData), [mindMapData]);
  const FUSE_INSTANCE = useMemo(() => new Fuse(FLATTENED_DATA, FUSE_OPTIONS), [FLATTENED_DATA]);

  // Tree traversal helper
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

  // Node focus and expansion path
  const focusNode = useCallback(
    (nodeId) => {
      setNodeFocus(nodeId);

      // Expand path to node
      const expandPath = (node) => {
        if (!node) return false;
        if (node.id === nodeId) return true;

        for (const child of (node.children || [])) {
          if (expandPath(child)) {
            setExpandedNodes((prev) => new Set([...prev, node.id]));
            return true;
          }
        }
        return false;
      };

      expandPath(mindMapData);
    },
    [mindMapData]
  );

  // Enhanced filter functionality
  const filterData = useCallback(
    (term) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        if (!term.trim()) {
          setFilteredData(mindMapData);
          setNodeFocus(null);
          return;
        }

        const searchResults = FUSE_INSTANCE.search(term);
        const matchedIds = new Set(searchResults.map((result) => result.item.id));

        // Focus on first result
        if (searchResults.length > 0) {
          focusNode(searchResults[0].item.id);
        }

        // Expand parent nodes of matches
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
    [mindMapData, FUSE_INSTANCE, FLATTENED_DATA, focusNode, traverseTree]
  );

  // Undo and Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);

      // Restore previous state
      setExpandedNodes(new Set(previousState.expandedNodes));

      if (previousState.searchTerm !== undefined) {
        setSearchTerm(previousState.searchTerm);
        filterData(previousState.searchTerm);
      }

      if (previousState.zoomLevel !== undefined) {
        setZoomLevel(previousState.zoomLevel);
      }

      if (previousState.viewPosition !== undefined) {
        setViewPosition(previousState.viewPosition);
      }
    }
  }, [history, historyIndex, filterData]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);

      // Restore next state
      setExpandedNodes(new Set(nextState.expandedNodes));

      if (nextState.searchTerm !== undefined) {
        setSearchTerm(nextState.searchTerm);
        filterData(nextState.searchTerm);
      }

      if (nextState.zoomLevel !== undefined) {
        setZoomLevel(nextState.zoomLevel);
      }

      if (nextState.viewPosition !== undefined) {
        setViewPosition(nextState.viewPosition);
      }
    }
  }, [history, historyIndex, filterData]);

  // Add to History
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

  // Node expansion controls
  const collapseAll = useCallback(() => {
    addToHistory({ type: 'COLLAPSE_ALL', expandedNodes: Array.from(expandedNodes) });
    setExpandedNodes(new Set([ROOT_NODE_ID]));
  }, [expandedNodes, addToHistory]);

  const expandAll = useCallback(() => {
    addToHistory({ type: 'EXPAND_ALL', expandedNodes: Array.from(expandedNodes) });
    const allIds = new Set(FLATTENED_DATA.map((node) => node.id));
    allIds.add(ROOT_NODE_ID);
    setExpandedNodes(allIds);
  }, [FLATTENED_DATA, expandedNodes, addToHistory]);

  // Zoom controls
  const handleZoom = useCallback((delta, centerX, centerY) => {
    setZoomLevel((prevZoom) => {
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, prevZoom + delta * ZOOM_STEP)
      );

      // Adjust view position to zoom toward cursor
      if (centerX !== undefined && centerY !== undefined) {
        const zoomFactor = newZoom / prevZoom;
        setViewPosition((prev) => ({
          x: centerX - (centerX - prev.x) * zoomFactor,
          y: centerY - (centerY - prev.y) * zoomFactor,
        }));
      }

      return newZoom;
    });
  }, []);

  // Pan controls
  const handlePanStart = useCallback((e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    viewStartRef.current = { ...viewPosition };
  }, [viewPosition]);

  const handlePanMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      setViewPosition({
        x: viewStartRef.current.x + dx,
        y: viewStartRef.current.y + dy,
      });
    },
    [isDragging]
  );

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
    viewStartRef.current = null;
  }, []);

  // Export functionality
  const exportMindMap = useCallback(() => {
    const exportData = {
      data: mindMapData,
      expandedNodes: Array.from(expandedNodes),
      version: '1.0',
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'mindmap-export.json');
  }, [mindMapData, expandedNodes]);

  // Screenshot functionality
  const takeScreenshot = useCallback(async () => {
    if (!mindMapRef.current) return;

    try {
      const dataUrl = await toPng(mindMapRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = 'mindmap-screenshot.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  }, []);

  // Share functionality
  const shareMindMap = useCallback(async () => {
    const shareData = {
      title: 'Mind Map Share',
      text: 'Check out this mind map!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a notification here
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    }
  }, []);

  // Node management
  const toggleNode = useCallback(
    (nodeId) => {
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

  // Reset View
  const resetView = useCallback(() => {
    addToHistory({
      type: 'RESET_VIEW',
      searchTerm,
      expandedNodes: Array.from(expandedNodes),
      zoomLevel,
      viewPosition,
    });

    setSearchTerm('');
    setFilteredData(mindMapData);
    setExpandedNodes(new Set([ROOT_NODE_ID]));
    setZoomLevel(1);
    setViewPosition({ x: 0, y: 0 });
    setNodeFocus(null);
  }, [addToHistory, expandedNodes, searchTerm, mindMapData, zoomLevel, viewPosition]);

  // Analytics and metrics
  const getNodeMetrics = useCallback(() => {
    let totalNodes = 0;
    let maxDepth = 0;
    let expandedCount = expandedNodes.size;
    let leafNodes = 0;

    const calculateMetrics = (node, depth = 0) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);

      if (!node.children || node.children.length === 0) {
        leafNodes++;
      } else {
        node.children.forEach(child => calculateMetrics(child, depth + 1));
      }
    };

    calculateMetrics(mindMapData);

    return {
      totalNodes,
      maxDepth,
      expandedCount,
      leafNodes,
      expansionRatio: totalNodes > 0 ? expandedCount / totalNodes : 0,
    };
  }, [mindMapData, expandedNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' && event.key !== 'Escape') {
        return;
      }

      const matchesShortcut = (shortcut) =>
        event.key === shortcut.key &&
        event.ctrlKey === !!shortcut.ctrlKey &&
        event.shiftKey === !!shortcut.shiftKey;

      Object.entries(SHORTCUTS).forEach(([action, shortcut]) => {
        if (matchesShortcut(shortcut)) {
          event.preventDefault();

          switch (action) {
            case 'ZOOM_IN':
              handleZoom(1);
              break;
            case 'ZOOM_OUT':
              handleZoom(-1);
              break;
            case 'TOGGLE_MINIMAP':
              setShowMiniMap(prev => !prev);
              break;
            case 'TAKE_SCREENSHOT':
              takeScreenshot();
              break;
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
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleZoom,
    takeScreenshot,
    collapseAll,
    expandAll,
    filterData,
    resetView,
    searchTerm,
    undo,
    redo,
  ]);

  // Gesture handling for touch devices
  useEffect(() => {
    if (!mindMapRef.current) return;

    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = zoomLevel;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const scale = currentDistance / initialDistance;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialZoom * scale));

        setZoomLevel(newZoom);
      }
    };

    const element = mindMapRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [zoomLevel]);

  // Context value
  const contextValue = useMemo(
    () => ({
      // Core state
      searchTerm,
      setSearchTerm,
      filteredData,
      filterData,
      expandedNodes,
      toggleNode,

      // Refs
      searchInputRef,
      mindMapRef,

      // View controls
      zoomLevel,
      viewPosition,
      handleZoom,
      handlePanStart,
      handlePanMove,
      handlePanEnd,
      isDragging,

      // Node focus
      selectedNode,
      setSelectedNode,
      nodeFocus,
      focusNode,

      // Mini-map
      showMiniMap,
      setShowMiniMap,

      // Export and sharing
      exportMindMap,
      takeScreenshot,
      shareMindMap,

      // History
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1,
      undo,
      redo,

      // View management
      collapseAll,
      expandAll,
      resetView,

      // Metrics
      getNodeMetrics,

      // Original data
      mindMapData,
    }),
    [
      searchTerm,
      filteredData,
      expandedNodes,
      toggleNode,
      zoomLevel,
      viewPosition,
      handleZoom,
      handlePanStart,
      handlePanMove,
      handlePanEnd,
      isDragging,
      selectedNode,
      nodeFocus,
      showMiniMap,
      historyIndex,
      history,
      mindMapData,
      filterData,
      collapseAll,
      expandAll,
      undo,
      redo,
      resetView,
      getNodeMetrics,
      focusNode,
      exportMindMap,
      takeScreenshot,
      shareMindMap,
      setShowMiniMap,
      setSelectedNode,
    ]
  );

  return (
    <MindMapContext.Provider value={contextValue}>
      {children}
    </MindMapContext.Provider>
  );
};

// Custom hook
export const useMindMap = () => {
  const context = useContext(MindMapContext);
  if (!context) {
    throw new Error('useMindMap must be used within a MindMapProvider');
  }
  return context;
};

export { MindMapProvider };
