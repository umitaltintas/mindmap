// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode via class
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6', // Blue-500
          dark: '#2563EB', // Blue-600
        },
        secondary: {
          light: '#10B981', // Green-500
          dark: '#059669', // Green-600
        },
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
};
