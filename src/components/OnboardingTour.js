import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const OnboardingTour = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Mind Map!",
      content: "Let's take a quick tour of the key features.",
      target: null
    },
    {
      title: "Quick Search",
      content: "Press Ctrl + K to quickly search through your mind map.",
      target: ".search-input"
    },
    {
      title: "Node Controls",
      content: "Click on any node to expand/collapse. Use right-click or the menu for more options.",
      target: ".tree-node"
    },
    {
      title: "Keyboard Shortcuts",
      content: "Use Ctrl + [ to collapse all, Ctrl + ] to expand all, and Ctrl + M to toggle minimap.",
      target: null
    }
  ];

  const handleComplete = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setShowTour(false);
  };

  if (!showTour) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">
            {steps[currentStep].title}
          </h2>
          <button
            onClick={handleComplete}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {steps[currentStep].content}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 text-blue-500"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Get Started
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingTour;