import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

export const exportToJson = (data, expandedNodes) => {
  const exportData = {
    data,
    expandedNodes: Array.from(expandedNodes),
    version: '1.0',
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  saveAs(blob, 'mindmap-export.json');
};

export const exportToPng = async (element, options = {}) => {
  if (!element) return;

  const defaultOptions = {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
    quality: 1,
    ...options,
  };

  try {
    const dataUrl = await toPng(element, defaultOptions);
    const link = document.createElement('a');
    link.download = 'mindmap-screenshot.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export to PNG failed:', err);
    throw err;
  }
};

export const shareMindMap = async (title = 'Mind Map Share', text = 'Check out this mind map!') => {
  const shareData = {
    title,
    text,
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
      console.log('Link copied to clipboard');
    }
  } catch (err) {
    console.error('Sharing failed:', err);
    throw err;
  }
};

export const exportToMarkdown = (data) => {
  const generateMarkdown = (node, level = 0) => {
    const indent = '  '.repeat(level);
    let markdown = `${indent}- ${node.name}\n`;
    
    if (node.description) {
      markdown += `${indent}  ${node.description}\n`;
    }

    if (node.children?.length > 0) {
      markdown += node.children
        .map(child => generateMarkdown(child, level + 1))
        .join('');
    }

    return markdown;
  };

  const markdown = generateMarkdown(data);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  saveAs(blob, 'mindmap-export.md');
};

export const importFromJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.data || !parsed.expandedNodes) {
      throw new Error('Invalid mind map data format');
    }
    return parsed;
  } catch (err) {
    console.error('Import failed:', err);
    throw err;
  }
};  