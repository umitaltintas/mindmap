// src/components/MindMapView.js
import React, { useRef } from 'react';
import { useMindMap } from '../context/MindMapContext';
import SearchBar from './SearchBar';
import TreeNode from './TreeNode';
import MindMapControls from './MindMapControls';
import { MiniMap, NodeMetrics } from './EnhancedFeatures';

const MindMapView = () => {
  const { 
    filteredData, 
    searchTerm,
    mindMapRef,
    zoomLevel,
    showMiniMap
  } = useMindMap();

  const containerRef = useRef(null);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen"
    >
      {/* Header Controls */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full sm:w-2/3">
            <SearchBar />
          </div>
          <MindMapControls />
        </div>
        <NodeMetrics />
      </div>

      {/* Main Content */}
      <div
        ref={mindMapRef}
        className="relative transition-transform duration-75"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: '0 0'
        }}
      >
        <TreeNode 
          node={filteredData} 
          searchTerm={searchTerm} 
          isRoot={true} 
        />
      </div>
      
      {/* Mini Map */}
      {showMiniMap && (
        <MiniMap 
          data={filteredData}
          zoomLevel={zoomLevel}
        />
      )}
    </div>
  );
};

export default MindMapView;