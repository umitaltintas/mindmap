// src/components/VirtualizedTree.js
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import TreeNode from './TreeNode';
import { useMindMap } from '../context/MindMapContext';

const VirtualizedTree = () => {
  const { flattenedNodes } = useMindMap(); // Flattened nodes for virtualization

  return (
    <List
      height={600}
      itemCount={flattenedNodes.length}
      itemSize={35}
      width={'100%'}
    >
      {({ index, style }) => (
        <div style={style}>
          <TreeNode node={flattenedNodes[index]} />
        </div>
      )}
    </List>
  );
};

export default VirtualizedTree;
