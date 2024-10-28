import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMap } from '../context/MindMapContext';

export const MiniMap = ({ data, zoomLevel }) => {
  const miniMapRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapScale, setMapScale] = useState(0.1);
  const { mindMapRef } = useMindMap();

  useEffect(() => {
    if (mindMapRef.current && miniMapRef.current) {
      const mindMapRect = mindMapRef.current.getBoundingClientRect();
      const scale = Math.min(
        150 / mindMapRect.width,
        100 / mindMapRect.height
      );
      setMapScale(scale);
    }
  }, [mindMapRef]);

  const renderNode = (node, x = 0, y = 0, level = 0) => {
    const nodeWidth = 20;
    const nodeHeight = 10;
    const verticalGap = 15;
    const horizontalGap = 30;

    return (
      <g key={node.id}>
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          rx={2}
          className="fill-gray-300 dark:fill-gray-600"
        />
        {node.children?.map((child, index) => {
          const childX = x + horizontalGap;
          const childY = y + (index * (nodeHeight + verticalGap));

          return (
            <g key={child.id}>
              <line
                x1={x + nodeWidth}
                y1={y + nodeHeight / 2}
                x2={childX}
                y2={childY + nodeHeight / 2}
                className="stroke-gray-300 dark:stroke-gray-600"
                strokeWidth="1"
              />
              {renderNode(child, childX, childY, level + 1)}
            </g>
          );
        })}
      </g>
    );
  };

  const handleClick = (e) => {
    if (!miniMapRef.current) return;

    const rect = miniMapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / mapScale;
    const y = (e.clientY - rect.top) / mapScale;

    // Update main view position
  };

  return (
    <div
      ref={miniMapRef}
      className="fixed bottom-20 right-4 w-[200px] h-[150px] 
                 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                 border border-gray-200 dark:border-gray-700
                 overflow-hidden cursor-move"
      onClick={handleClick}
    >
      <div className="absolute inset-0 p-2">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`scale(${mapScale})`}>
            {renderNode(data)}
          </g>

          <rect

            width={window.innerWidth * mapScale / zoomLevel}
            height={window.innerHeight * mapScale / zoomLevel}
            className="fill-none stroke-blue-500 stroke-2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    </div>
  );
};

export const NodeMetrics = () => {
  const { getNodeMetrics } = useMindMap();
  const metrics = getNodeMetrics();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
      {[
        { label: 'Total Nodes', value: metrics.totalNodes },
        { label: 'Max Depth', value: metrics.maxDepth },
        { label: 'Expanded Nodes', value: metrics.expandedCount },
        { label: 'Leaf Nodes', value: metrics.leafNodes },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};

export const NodeActions = () => {
  const { selectedNode, deleteNode, editNode, addChild } = useMindMap();

  if (!selectedNode) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 bg-white dark:bg-gray-800 
                 rounded-lg shadow-lg border border-gray-200 
                 dark:border-gray-700 p-2"
    >
      <div className="flex flex-col gap-2">
        <button
          onClick={() => editNode(selectedNode)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700
                     dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     rounded-md transition-colors"
        >
          Edit Node
        </button>
        <button
          onClick={() => addChild(selectedNode)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700
                     dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                     rounded-md transition-colors"
        >
          Add Child
        </button>
        <button
          onClick={() => deleteNode(selectedNode)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600
                     dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30
                     rounded-md transition-colors"
        >
          Delete Node
        </button>
      </div>
    </motion.div>
  );
};

export const SearchResults = ({ results }) => {
  const { focusNode } = useMindMap();

  if (!results?.length) return null;

  return (
    <div className="absolute top [calc(100% + 0.5rem)] left-0 w-full z-50">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => focusNode(result.id)}
            className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                       rounded-md transition-colors"
          >
            {result.title}
          </div>
        ))}
      </div>

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0">
        <div className="w-0 h-0 border-4 border-gray-100 border-dashed rounded-full animate-ping" />
      </div>
    </div>
  );

}

export const SearchBar = () => {
  const { searchResults, searchQuery, setSearchQuery } = useMindMap();

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search nodes..."
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none"
      />
      <SearchResults results={searchResults} />
    </div>
  );
};
