import React, { useEffect } from 'react';
import { useMindMap } from '../context/MindMapContext';

const KeyboardNavigation = () => {
  const {
    mindMapData,
    selectedNode,
    setSelectedNode,
    expandedNodes,
    toggleNode,
    focusNode
  } = useMindMap();

  // Helper to find next/previous/parent/child node
  const findRelativeNode = (currentId, direction) => {
    const findNodeById = (node, id) => {
      if (node.id === id) return node;
      if (!node.children) return null;
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
      return null;
    };

    const findSiblings = (node, parentNode) => {
      if (!parentNode?.children) return [];
      return parentNode.children;
    };

    const currentNode = findNodeById(mindMapData, currentId);
    if (!currentNode) return null;

    switch (direction) {
      case 'up': {
        // Find previous sibling or parent
        const siblings = findSiblings(currentNode, findNodeById(mindMapData, currentId));
        const currentIndex = siblings.findIndex(node => node.id === currentId);
        return siblings[currentIndex - 1]?.id || null;
      }
      case 'down': {
        // Find next sibling or first child
        if (currentNode.children?.length && expandedNodes.has(currentId)) {
          return currentNode.children[0].id;
        }
        const siblings = findSiblings(currentNode, findNodeById(mindMapData, currentId));
        const currentIndex = siblings.findIndex(node => node.id === currentId);
        return siblings[currentIndex + 1]?.id || null;
      }
      case 'left': {
        // Collapse if expanded, or go to parent
        if (expandedNodes.has(currentId)) {
          return { type: 'collapse', id: currentId };
        }
        // Find parent logic here
        return null;
      }
      case 'right': {
        // Expand if has children
        if (currentNode.children?.length && !expandedNodes.has(currentId)) {
          return { type: 'expand', id: currentId };
        }
        return null;
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedNode || e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          const upNode = findRelativeNode(selectedNode, 'up');
          if (upNode) {
            setSelectedNode(upNode);
            focusNode(upNode);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          const downNode = findRelativeNode(selectedNode, 'down');
          if (downNode) {
            setSelectedNode(downNode);
            focusNode(downNode);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          const leftResult = findRelativeNode(selectedNode, 'left');
          if (leftResult?.type === 'collapse') {
            toggleNode(leftResult.id);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          const rightResult = findRelativeNode(selectedNode, 'right');
          if (rightResult?.type === 'expand') {
            toggleNode(rightResult.id);
          }
          break;

        case 'Enter':
          e.preventDefault();
          toggleNode(selectedNode);
          break;

        case 'Escape':
          e.preventDefault();
          setSelectedNode(null);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, expandedNodes, setSelectedNode, toggleNode, focusNode]);

  return null; // This is a behavior-only component
};

export default KeyboardNavigation;