// src/components/MindMapView.js

import React from 'react';
import { useMindMap } from '../context/MindMapContext';
import SearchBar from './SearchBar';
import TreeNode from './TreeNode';
import MindMapControls from './MindMapControls';

const MindMapView = () => {
  const { filteredData, searchTerm } = useMindMap();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="w-full sm:w-2/3">
          <SearchBar />
        </div>
        <MindMapControls />
      </div>
      {/* Pass isRoot={true} to the root TreeNode */}
      <TreeNode node={filteredData} searchTerm={searchTerm} isRoot={true} />
    </div>
  );
};

export default MindMapView;
