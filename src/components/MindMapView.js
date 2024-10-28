// src/components/MindMapView.js

import React, { useRef, useEffect } from 'react';
import { useMindMap } from '../context/MindMapContext';
import SearchBar from './SearchBar';
import TreeNode from './TreeNode';
import MindMapControls from './MindMapControls';
import { MiniMap, EnhancedControls, NodeMetrics } from './EnhancedFeatures';

const MindMapView = () => {
  const { 
    filteredData, 
    searchTerm,
    mindMapRef,
    zoomLevel,
    viewPosition,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isDragging,
    showMiniMap
  } = useMindMap();

  const containerRef = useRef(null);

  // Handle mouse events for panning
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click only
        handlePanStart(e);
      }
    };

    const handleMouseMove = (e) => {
      handlePanMove(e);
    };

    const handleMouseUp = () => {
      handlePanEnd();
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handlePanStart, handlePanMove, handlePanEnd]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
          transform: `scale(${zoomLevel}) translate(${viewPosition.x}px, ${viewPosition.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        <TreeNode 
          node={filteredData} 
          searchTerm={searchTerm} 
          isRoot={true} 
        />
      </div>

      {/* Floating Controls */}
      <EnhancedControls />
      
      {/* Mini Map */}
      {showMiniMap && (
        <MiniMap 
          data={filteredData}
          zoomLevel={zoomLevel}
          viewPosition={viewPosition}
        />
      )}
    </div>
  );
};

export default MindMapView;