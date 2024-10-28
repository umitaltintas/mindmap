// src/components/ui/Input.js
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Input = ({ className, ...props }) => {
  return (
    <input
      className={classNames(
        "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
