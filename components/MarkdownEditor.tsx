"use client";

import { useState, useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your text here...", 
  rows = 6,
  className = ""
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + text.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const formatButtonClass = "p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200";

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Text Formatting */}
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("**", "**")}
          title="Bold"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12 6v8h2.5a2.5 2.5 0 100-5H12zM8 6v8h2.5a2.5 2.5 0 100-5H8z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("*", "*")}
          title="Italic"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 4v12h2V4h-2z"/>
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("# ")}
          title="Heading 1"
        >
          H1
        </button>
        
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("## ")}
          title="Heading 2"
        >
          H2
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("- ")}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("1. ")}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Spacing and Structure */}
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertAtCursor("\n\n")}
          title="Add Line Break"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
        </button>

        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("---\n")}
          title="Horizontal Line"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Quick Templates */}
        <button
          type="button"
          className={formatButtonClass}
          onClick={() => insertText("**Experience:**\n- \n- \n\n**Services:**\n- \n- \n\n**Certifications:**\n- ")}
          title="Insert Template"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 font-mono text-sm"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Preview Toggle */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>💡 <strong>Formatting Tips:</strong></p>
        <ul className="mt-1 space-y-1">
          <li>• <code>**text**</code> for <strong>bold</strong></li>
          <li>• <code>*text*</code> for <em>italic</em></li>
          <li>• <code># Heading</code> for titles</li>
          <li>• <code>- item</code> for bullet lists</li>
          <li>• <code>1. item</code> for numbered lists</li>
          <li>• <code>---</code> for horizontal lines</li>
        </ul>
      </div>
    </div>
  );
} 