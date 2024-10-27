// src/components/TreeNode.js
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'react-feather';

const TreeNode = ({ node }) => {
  const [isOpen, setIsOpen] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4 mt-2">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
          )
        ) : (
          <span className="w-4 h-4 mr-2" />
        )}
        <div>
          <h2 className="text-lg font-semibold">{node.name}</h2>
          <p className="text-sm text-gray-600">{node.description}</p>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-6 border-l-2 border-gray-300 pl-4">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
