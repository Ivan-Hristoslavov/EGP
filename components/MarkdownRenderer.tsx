"use client";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    if (!text) return "";

    // Split into lines for processing
    const lines = text.split('\n');
    const processedLines = lines.map((line, index) => {
      let processedLine = line;

      // Headings
      if (line.startsWith('# ')) {
        return `<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">${line.substring(2)}</h1>`;
      }
      if (line.startsWith('## ')) {
        return `<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">${line.substring(3)}</h2>`;
      }
      if (line.startsWith('### ')) {
        return `<h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">${line.substring(4)}</h3>`;
      }

      // Horizontal line
      if (line.trim() === '---') {
        return '<hr class="my-4 border-gray-300 dark:border-gray-600">';
      }

      // Lists
      if (line.startsWith('- ')) {
        return `<li class="ml-4 mb-1">${line.substring(2)}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li class="ml-4 mb-1">${line.replace(/^\d+\.\s/, '')}</li>`;
      }

      // Regular paragraph
      if (line.trim()) {
        // Process inline formatting
        let processed = line;
        
        // Bold
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        
        // Italic
        processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        
        // Links (basic support)
        processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return `<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">${processed}</p>`;
      }

      // Empty lines for spacing
      return '<br>';
    });

    // Group list items
    const result = [];
    let inList = false;
    let listItems = [];

    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
      
      if (line.includes('<li')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line);
      } else {
        if (inList && listItems.length > 0) {
          result.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join('')}</ul>`);
          inList = false;
          listItems = [];
        }
        result.push(line);
      }
    }

    // Handle list at the end
    if (inList && listItems.length > 0) {
      result.push(`<ul class="list-disc list-inside mb-4 space-y-1">${listItems.join('')}</ul>`);
    }

    return result.join('');
  };

  return (
    <div 
      className={`prose prose-gray dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
} 