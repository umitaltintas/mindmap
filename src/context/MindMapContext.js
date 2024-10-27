
// src/context/MindMapContext.js
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import mindMapData from '../mindMapData.json';
const MindMapContext = createContext();
export const MindMapProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(mindMapData);
  const fuse = useMemo(() => {
    return new Fuse(mindMapData.children, {
      keys: ['name', 'description'],
      includeMatches: true,
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, []);
  const filterData = useCallback((term) => {
    if (term.trim() === '') {
      setFilteredData(mindMapData);
      return;
    }
    const results = fuse.search(term);
    const matchedNodes = results.map(result => result.item);
    const includeParents = (node, matches) => {
      if (matches.includes(node)) return { ...node };
      if (node.children) {
        const filteredChildren = node.children
          .map(child => includeParents(child, matches))
          .filter(Boolean);
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
      }
      return null;
    };
    const newChildren = mindMapData.children
      .map(child => includeParents(child, matchedNodes))
      .filter(Boolean);
    setFilteredData({ ...mindMapData, children: newChildren });
  }, [fuse]);
  const value = {
    searchTerm,
    setSearchTerm,
    filteredData,
    filterData,
  };
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