// src/context/MindMapContext.js
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import mindMapData from '../mindMapData.json';

const MindMapContext = createContext();

// Optimize keyboard shortcuts configuration
const SHORTCUTS = {
    SEARCH_FOCUS: { key: 'k', ctrlKey: true },
    COLLAPSE_ALL: { key: '[', ctrlKey: true },
    EXPAND_ALL: { key: ']', ctrlKey: true },
    CLEAR_SEARCH: { key: 'Escape', ctrlKey: false },
    RESET_VIEW: { key: 'r', ctrlKey: true },
    UNDO: { key: 'z', ctrlKey: true },
    REDO: { key: 'y', ctrlKey: true },
};

// Pre-compute flattened data structure for better search performance
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
            hasChildren: Boolean(node.children?.length)
        });

        node.children?.forEach(child => traverse(child, currentPath, depth + 1));
    };
    traverse(data);
    return result;
};

const FLATTENED_DATA = createFlattenedData(mindMapData);

// Optimize Fuse.js configuration for better search results
const FUSE_OPTIONS = {
    keys: [
        { name: 'name', weight: 0.7 },
        { name: 'description', weight: 0.3 },
        { name: 'path', weight: 0.2 }
    ],
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 2,
    useExtendedSearch: true,
    includeMatches: true,
    ignoreLocation: true
};

const FUSE_INSTANCE = new Fuse(FLATTENED_DATA, FUSE_OPTIONS);

// Maximum history states to keep
const MAX_HISTORY_STATES = 50;

export const MindMapProvider = ({ children }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(mindMapData);
    const [expandedNodes, setExpandedNodes] = useState(new Set());
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const searchInputRef = useRef(null);
    const searchDebounceRef = useRef(null);

    // Optimize history management with batch updates
    const addToHistory = useCallback((action) => {
        setHistory(prev => {
            const newHistory = [
                ...prev.slice(0, historyIndex + 1),
                { ...action, timestamp: Date.now() }
            ].slice(-MAX_HISTORY_STATES);
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY_STATES - 1));
    }, [historyIndex]);

    // Optimize tree traversal with memoization
    const traverseTree = useCallback((node, matchedIds, parentMatched = false) => {
        const isMatched = matchedIds.has(node.id) || parentMatched;

        if (!isMatched && !node.children?.some(child => matchedIds.has(child.id))) {
            return null;
        }

        const newNode = { ...node };
        if (node.children) {
            const filteredChildren = node.children
                .map(child => traverseTree(child, matchedIds, isMatched))
                .filter(Boolean);

            if (filteredChildren.length > 0) {
                newNode.children = filteredChildren;
            } else if (!isMatched) {
                return null;
            }
        }

        return newNode;
    }, []);

    // Optimize search functionality with debouncing and memoization
    const filterData = useCallback((term) => {
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            if (!term.trim()) {
                setFilteredData(mindMapData);
                return;
            }

            const searchResults = FUSE_INSTANCE.search(term);
            const matchedIds = new Set(searchResults.map(result => result.item.id));

            // Auto-expand parent nodes of matches
            const expandIds = new Set();
            searchResults.forEach(result => {
                result.item.path.forEach((_, index) => {
                    const ancestorId = FLATTENED_DATA[index]?.id;
                    if (ancestorId) expandIds.add(ancestorId);
                });
            });

            setExpandedNodes(prev => new Set([...prev, ...expandIds]));
            const filteredTree = traverseTree(mindMapData, matchedIds);
            setFilteredData(filteredTree || { ...mindMapData, children: [] });
        }, 150);
    }, [traverseTree]);

    // Update this part in your MindMapContext.js
    // Update this part in your MindMapContext.js
    const toggleNode = useCallback((nodeId) => {
        addToHistory({
            type: 'TOGGLE_NODE',
            nodeId,
            expandedNodes: Array.from(expandedNodes)
        });

        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                // When collapsing, only remove the clicked node
                next.delete(nodeId);
            } else {
                // When expanding, just add the clicked node
                next.add(nodeId);
            }
            return next;
        });
    }, [expandedNodes, addToHistory]);

    // Memoized context value
    const contextValue = useMemo(() => ({
        searchTerm,
        setSearchTerm,
        filteredData,
        filterData,
        expandedNodes,
        toggleNode,
        searchInputRef,
        // Additional utility functions...
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo: () => {
            if (historyIndex > 0) {
                const previousState = history[historyIndex - 1];
                setHistoryIndex(prev => prev - 1);
                setExpandedNodes(new Set(previousState.expandedNodes));
                if (previousState.searchTerm !== undefined) {
                    setSearchTerm(previousState.searchTerm);
                    filterData(previousState.searchTerm);
                }
            }
        },
        redo: () => {
            if (historyIndex < history.length - 1) {
                const nextState = history[historyIndex + 1];
                setHistoryIndex(prev => prev + 1);
                setExpandedNodes(new Set(nextState.expandedNodes));
                if (nextState.searchTerm !== undefined) {
                    setSearchTerm(nextState.searchTerm);
                    filterData(nextState.searchTerm);
                }
            }
        },
        collapseAll: () => {
            addToHistory({ type: 'COLLAPSE_ALL', expandedNodes: Array.from(expandedNodes) });
            setExpandedNodes(new Set());
        },
        expandAll: () => {
            addToHistory({ type: 'EXPAND_ALL', expandedNodes: Array.from(expandedNodes) });
            const allIds = new Set(FLATTENED_DATA.map(node => node.id));
            setExpandedNodes(allIds);
        },
        resetView: () => {
            addToHistory({
                type: 'RESET_VIEW',
                searchTerm,
                expandedNodes: Array.from(expandedNodes)
            });
            setSearchTerm('');
            setFilteredData(mindMapData);
            setExpandedNodes(new Set());
        }
    }), [
        searchTerm,
        filteredData,
        expandedNodes,
        toggleNode,
        filterData,
        historyIndex,
        history,
        addToHistory
    ]);

    // Set up keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Skip if we're in an input field (except for Escape)
            if (event.target.tagName === 'INPUT' && event.key !== 'Escape') {
                return;
            }

            const shortcut = Object.entries(SHORTCUTS).find(([_, config]) =>
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
                        contextValue.collapseAll();
                        break;
                    case 'EXPAND_ALL':
                        contextValue.expandAll();
                        break;
                    case 'CLEAR_SEARCH':
                        if (searchTerm) {
                            setSearchTerm('');
                            filterData('');
                        }
                        break;
                    case 'RESET_VIEW':
                        contextValue.resetView();
                        break;
                    case 'UNDO':
                        contextValue.undo();
                        break;
                    case 'REDO':
                        contextValue.redo();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [contextValue, searchTerm, filterData]);

    return (
        <MindMapContext.Provider value={contextValue}>
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