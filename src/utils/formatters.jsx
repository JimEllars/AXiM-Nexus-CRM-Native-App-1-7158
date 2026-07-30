import React from 'react';

export const parseMarkdown = (text) => {
  if (!text) return text;

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">$1</a>')
    .replace(/\n/g, '<br />');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
