// src/components/LoadingOverlay.js
import React from 'react';
import PropTypes from 'prop-types';

const LoadingOverlay = ({ message = "Loading...", spinnerSize = "w-16 h-16" }) => {
  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-gray-50 dark:bg-gray-900 z-50"
      role="alert"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="text-center">
        <div
          className={`flex justify-center items-center ${spinnerSize} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4`}
          aria-hidden="true"
        ></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  /**
   * The loading message to display below the spinner.
   */
  message: PropTypes.string,
  /**
   * Tailwind CSS classes to define the spinner size.
   * Example: "w-16 h-16"
   */
  spinnerSize: PropTypes.string,
};

export default LoadingOverlay;
