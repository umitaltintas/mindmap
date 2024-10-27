// src/App.js
import React from 'react';
import TreeNode from './components/TreeNode';
import mindMapData from './mindMapData.json';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-10">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Makroekonomi Mindmap</h1>
        <TreeNode node={mindMapData} />
      </div>
    </div>
  );
}

export default App;
