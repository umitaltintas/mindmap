import React from 'react';
import { motion } from 'framer-motion';

const NodeSkeleton = ({ level = 0 }) => {
  return (
    <div className={`${level > 0 ? 'ml-6' : ''} animate-pulse`}>
      <div className="flex items-center gap-3 p-4">
        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      {level < 2 && (
        <div className="pl-6 border-l-2 border-gray-200 dark:border-gray-700 ml-4 mt-2">
          {[...Array(2)].map((_, index) => (
            <NodeSkeleton key={index} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {[...Array(3)].map((_, index) => (
        <NodeSkeleton key={index} />
      ))}
    </motion.div>
  );
};

export default LoadingSkeleton;