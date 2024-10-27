// src/utils/assignIds.js

import { v4 as uuidv4 } from 'uuid';

/**
 * Recursively assigns unique IDs to each node in the mind map data structure
 * @param {Object} node - The node to process
 * @param {boolean} [isRoot=true] - Whether this is the root node
 * @returns {Object} - The node with assigned IDs
 */
const assignUniqueIds = (node, isRoot = true) => {
  // Create a new object to avoid mutating the original
  const processedNode = {
    ...node,
    id: node.id || uuidv4(), // Preserve existing ID if present, otherwise generate new
  };

  // If the node has children, recursively process them
  if (Array.isArray(node.children)) {
    processedNode.children = node.children.map(child =>
      assignUniqueIds(child, false)
    );
  }

  return processedNode;
};

export default assignUniqueIds;