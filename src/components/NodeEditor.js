import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMindMap } from '../context/MindMapContext';

const NodeEditor = ({ nodeId, onClose }) => {
  const { mindMapData, updateNode, deleteNode, addChild } = useMindMap();
  const [node, setNode] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    tags: []
  });

  useEffect(() => {
    const findNode = (data, id) => {
      if (data.id === id) return data;
      if (data.children) {
        for (const child of data.children) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
      return null;
    };

    const foundNode = findNode(mindMapData, nodeId);
    if (foundNode) {
      setNode(foundNode);
      setFormData({
        name: foundNode.name || '',
        description: foundNode.description || '',
        color: foundNode.color || '#3B82F6',
        icon: foundNode.icon || '',
        tags: foundNode.tags || []
      });
    }
  }, [nodeId, mindMapData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateNode(nodeId, formData);
    onClose();
  };

  const handleDelete = () => {
    deleteNode(nodeId);
    onClose();
  };

  const handleAddChild = () => {
    addChild(nodeId);
    onClose();
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center justify-between p-6 border-b 
                          border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-lg font-semibold text-gray-900 
                                     dark:text-white">
                Edit Node
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 
                                     dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 
                                  dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 
                             dark:border-gray-600 rounded-md shadow-sm
                             bg-white dark:bg-gray-700
                             text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 
                                  dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 
                             dark:border-gray-600 rounded-md shadow-sm
                             bg-white dark:bg-gray-700
                             text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 
                                  dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Choose a color for the node
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 
                                  dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 
                                 text-blue-800 dark:text-blue-200 rounded-full
                                 flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index)
                          })}
                          className="text-blue-600 dark:text-blue-400 
                                   hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Add tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, e.target.value]
                          });
                          e.target.value = '';
                        }
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 
                               dark:border-gray-600 rounded-full
                               bg-white dark:bg-gray-700
                               text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t 
                          border-gray-200 dark:border-gray-700 gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm
                           text-red-600 dark:text-red-400 hover:bg-red-50
                           dark:hover:bg-red-900/30 rounded-md transition-colors"
                >
                  <Trash className="w-4 h-4" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="flex items-center gap-2 px-4 py-2 text-sm
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100
                           dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Child
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Dialog.Close className="px-4 py-2 text-sm text-gray-500 
                                      hover:text-gray-700 dark:text-gray-400
                                      dark:hover:text-gray-200">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm
                           bg-blue-500 text-white rounded-md
                           hover:bg-blue-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

}

export default NodeEditor;