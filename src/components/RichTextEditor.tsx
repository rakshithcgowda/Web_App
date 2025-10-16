import { useState, useRef, useEffect, useCallback } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon } from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Enter explanatory note...", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      insertHTML('<br>');
    }
  };

  const insertHTML = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.insertNode(fragment);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const toggleFormatting = (format: 'bold' | 'italic' | 'underline') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    if (selectedText) {
      // Text is selected, wrap it with formatting
      const tag = format === 'bold' ? 'b' : format === 'italic' ? 'i' : 'u';
      const formattedHTML = `<${tag}>${selectedText}</${tag}>`;
      
      range.deleteContents();
      insertHTML(formattedHTML);
    } else {
      // No text selected, toggle formatting for new text
      const tag = format === 'bold' ? 'b' : format === 'italic' ? 'i' : 'u';
      const isCurrentlyActive = getFormattingState(format);
      
      if (isCurrentlyActive) {
        // Remove formatting
        const parentElement = range.commonAncestorContainer.parentElement;
        if (parentElement && parentElement.tagName.toLowerCase() === tag) {
          const textContent = parentElement.textContent || '';
          parentElement.outerHTML = textContent;
        }
      } else {
        // Add formatting
        insertHTML(`<${tag}></${tag}>`);
        // Move cursor inside the tag
        const newRange = document.createRange();
        const newSelection = window.getSelection();
        if (newSelection) {
          const editor = editorRef.current;
          if (editor) {
            const tagElements = editor.querySelectorAll(tag);
            const lastTag = tagElements[tagElements.length - 1];
            if (lastTag) {
              newRange.setStart(lastTag, 0);
              newRange.collapse(true);
              newSelection.removeAllRanges();
              newSelection.addRange(newRange);
            }
          }
        }
      }
    }
    
    editorRef.current?.focus();
    updateFormattingState();
  };

  const getFormattingState = (format: 'bold' | 'italic' | 'underline'): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    let element: Node | null = range.commonAncestorContainer;
    
    // If it's a text node, get its parent element
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }
    
    if (!element) return false;
    
    const tag = format === 'bold' ? 'b' : format === 'italic' ? 'i' : 'u';
    
    // Check if the current element or any parent has the formatting tag
    let currentElement: Element | null = element as Element;
    while (currentElement && currentElement !== editorRef.current) {
      if (currentElement.tagName.toLowerCase() === tag) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    
    return false;
  };

  const updateFormattingState = useCallback(() => {
    setIsBold(getFormattingState('bold'));
    setIsItalic(getFormattingState('italic'));
    setIsUnderline(getFormattingState('underline'));
  }, []);

  const handleSelectionChange = useCallback(() => {
    updateFormattingState();
  }, [updateFormattingState]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2">
        <button
          type="button"
          onClick={() => toggleFormatting('bold')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            isBold ? 'bg-gray-300 text-gray-800' : 'text-gray-600'
          }`}
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggleFormatting('italic')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            isItalic ? 'bg-gray-300 text-gray-800' : 'text-gray-600'
          }`}
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => toggleFormatting('underline')}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            isUnderline ? 'bg-gray-300 text-gray-800' : 'text-gray-600'
          }`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[100px] p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none"
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
    </div>
  );
}
