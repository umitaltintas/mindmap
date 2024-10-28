// src/context/AppProviders.js
import React from 'react';
import { MindMapProvider } from './MindMapContext';
import { ToastProvider } from './ToastContext';
import { ThemeProvider } from './ThemeContext';

const AppProviders = ({ children }) => (
  <ThemeProvider>
    <ToastProvider>
      <MindMapProvider>
        {children}
      </MindMapProvider>
    </ToastProvider>
  </ThemeProvider>
);

export default AppProviders;
