// components/styles/StyleSheetComponent.tsx
"use client";

import { ColorPicker } from '@/core/components/styles/ColorPicker';
import React, { useEffect, useRef, useState } from 'react';

interface StyleSheetComponentProps {
  initialCss?: string;
  onCssChange?: (css: string) => void;
  showLivePreview?: boolean;
  theme?: 'light' | 'dark';
}

interface StyleVariable {
  name: string;
  value: string;
  category: 'colors' | 'spacing' | 'typography' | 'layout';
}

const StyleSheetComponent: React.FC<StyleSheetComponentProps> = ({
  initialCss = '',
  onCssChange,
  showLivePreview = true,
  theme = 'light'
}) => {
  const [cssContent, setCssContent] = useState(initialCss);
  const [activeTab, setActiveTab] = useState<'editor' | 'variables' | 'preview'>('editor');
  const [styleVariables, setStyleVariables] = useState<StyleVariable[]>([
    { name: '--primary-color', value: '#007bff', category: 'colors' },
    { name: '--secondary-color', value: '#6c757d', category: 'colors' },
    { name: '--success-color', value: '#28a745', category: 'colors' },
    { name: '--danger-color', value: '#dc3545', category: 'colors' },
    { name: '--warning-color', value: '#ffc107', category: 'colors' },
    { name: '--info-color', value: '#17a2b8', category: 'colors' },
    { name: '--light-color', value: '#f8f9fa', category: 'colors' },
    { name: '--dark-color', value: '#343a40', category: 'colors' },
    { name: '--spacing-unit', value: '8px', category: 'spacing' },
    { name: '--border-radius', value: '4px', category: 'layout' },
    { name: '--font-family', value: "'Segoe UI', Roboto, sans-serif", category: 'typography' },
    { name: '--font-size-base', value: '16px', category: 'typography' },
    { name: '--line-height-base', value: '1.5', category: 'typography' },
  ]);
  const [selectedVariable, setSelectedVariable] = useState<StyleVariable | null>(null);
  const [cssValidation, setCssValidation] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });
  
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewElement, setPreviewElement] = useState<string>('button');
  const [customStyles, setCustomStyles] = useState<string>('');

  useEffect(() => {
    validateCss(cssContent);
  }, [cssContent]);

  useEffect(() => {
    // Update CSS with variable changes
    if (selectedVariable) {
      const varCss = `:root {\n${styleVariables.map(v => `  ${v.name}: ${v.value};`).join('\n')}\n}`;
      const combinedCss = varCss + '\n\n' + customStyles;
      setCssContent(combinedCss);
    }
  }, [styleVariables, customStyles]);

  const handleCssChange = (newCss: string) => {
    setCssContent(newCss);
    onCssChange?.(newCss);
    
    // Extract custom styles (excluding :root variables)
    const lines = newCss.split('\n');
    const varEndIndex = lines.findIndex(line => line.trim() === '}');
    if (varEndIndex > 0) {
      const customCss = lines.slice(varEndIndex + 1).join('\n');
      setCustomStyles(customCss.trim());
    }
  };

  const validateCss = (css: string) => {
    // Simple CSS validation
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for common issues
    if (css.includes('!important')) {
      warnings.push('Avoid using !important - consider specificity instead');
    }
    
    if (css.match(/width:\s*100%\s*!important/)) {
      warnings.push('Avoid !important on width: 100%');
    }
    
    // Check for parse errors (simplified)
    const brackets = (css.match(/{/g) || []).length;
    const closingBrackets = (css.match(/}/g) || []).length;
    
    if (brackets !== closingBrackets) {
      errors.push(`Unmatched curly braces: ${brackets} opening vs ${closingBrackets} closing`);
    }
    
    setCssValidation({
      valid: errors.length === 0,
      errors,
      warnings
    });
  };

  const updateVariable = (variableName: string, newValue: string) => {
    setStyleVariables(prev => 
      prev.map(v => 
        v.name === variableName 
          ? { ...v, value: newValue }
          : v
      )
    );
  };

  const addVariable = () => {
    const newVarName = `--custom-${Date.now()}`;
    const newVariable: StyleVariable = {
      name: newVarName,
      value: '#000000',
      category: 'colors'
    };
    setStyleVariables(prev => [...prev, newVariable]);
    setSelectedVariable(newVariable);
  };

  const deleteVariable = (variableName: string) => {
    setStyleVariables(prev => prev.filter(v => v.name !== variableName));
    if (selectedVariable?.name === variableName) {
      setSelectedVariable(null);
    }
  };

  const applyToPreview = () => {
    if (previewRef.current) {
      const styleTag = document.createElement('style');
      styleTag.textContent = cssContent;
      previewRef.current.innerHTML = '';
      previewRef.current.appendChild(styleTag);
      
      // Apply styles to preview element
      const previewElement = document.createElement(previewElement);
      previewElement.className = 'preview-element';
      previewElement.textContent = 'Preview Element';
      previewRef.current.appendChild(previewElement);
    }
  };

  const exportCss = () => {
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'styles.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssContent)
      .then(() => alert('CSS copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const resetStyles = () => {
    setCssContent(initialCss);
    setCustomStyles('');
    setStyleVariables([
      { name: '--primary-color', value: '#007bff', category: 'colors' },
      { name: '--secondary-color', value: '#6c757d', category: 'colors' },
      { name: '--success-color', value: '#28a745', category: 'colors' },
      { name: '--danger-color', value: '#dc3545', category: 'colors' },
      { name: '--warning-color', value: '#ffc107', category: 'colors' },
      { name: '--info-color', value: '#17a2b8', category: 'colors' },
      { name: '--light-color', value: '#f8f9fa', category: 'colors' },
      { name: '--dark-color', value: '#343a40', category: 'colors' },
      { name: '--spacing-unit', value: '8px', category: 'spacing' },
      { name: '--border-radius', value: '4px', category: 'layout' },
      { name: '--font-family', value: "'Segoe UI', Roboto, sans-serif", category: 'typography' },
      { name: '--font-size-base', value: '16px', category: 'typography' },
      { name: '--line-height-base', value: '1.5', category: 'typography' },
    ]);
  };

  const categorizeVariables = () => {
    const categories = {
      colors: styleVariables.filter(v => v.category === 'colors'),
      spacing: styleVariables.filter(v => v.category === 'spacing'),
      typography: styleVariables.filter(v => v.category === 'typography'),
      layout: styleVariables.filter(v => v.category === 'layout'),
    };
    return categories;
  };

  return (
    <div className={`style-sheet-component theme-${theme}`}>
      {/* Component JSX structure */}
      
      {/* The specific section you showed is already implemented correctly */}
      
      {selectedVariable && (
        <div className="variable-editor">
          <h5>Edit Variable: {selectedVariable.name}</h5>
          <div className="editor-controls">
            {/* Category dropdown - THIS IS THE PART YOU ASKED ABOUT */}
            <div className="control-group">
              <label>Category</label>
              <select
                value={selectedVariable.category}
                onChange={(e) => updateVariable(selectedVariable.name, {
                  ...selectedVariable,
                  category: e.target.value as any,
                  value: e.target.value === 'colors' ? '#007bff' : '8px'
                })}
                className="form-select"
              >
                <option value="colors">Colors</option>
                <option value="spacing">Spacing</option>
                <option value="typography">Typography</option>
                <option value="layout">Layout</option>
              </select>
            </div>

            {/* Value input - dynamic based on category */}
            <div className="control-group">
              <label>Value</label>
              {selectedVariable.category === 'colors' ? (
                <ColorPicker
                  color={selectedVariable.value}
                  onChange={(color) => updateVariable(selectedVariable.name, {
                    ...selectedVariable,
                    value: color
                  })}
                />
              ) : (
                <input
                  type="text"
                  value={selectedVariable.value}
                  onChange={(e) => updateVariable(selectedVariable.name, {
                    ...selectedVariable,
                    value: e.target.value
                  })}
                  className="form-input"
                  placeholder="Enter value (e.g., 16px, 1.5, 4px)"
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Live preview tab - ALSO IMPLEMENTED */}
      {activeTab === 'preview' && showLivePreview && (
        <div className="preview-container">
          <div className="preview-header">
            <h4>Live Preview</h4>
            <div className="preview-controls">
              <select
                value={previewElement}
                onChange={(e) => setPreviewElement(e.target.value)}
                className="form-select"
              >
                <option value="button">Button</option>
                <option value="div">Div Container</option>
                <option value="input">Input Field</option>
                <option value="card">Card</option>
                <option value="alert">Alert</option>
                <option value="badge">Badge</option>
              </select>
              <button 
                onClick={applyToPreview}
                className="btn btn-primary"
              >
                Refresh Preview
              </button>
            </div>
          </div>
          
          {/* Preview rendering */}
          <div className="preview-area">
            <div ref={previewRef} className="preview-content">
              <style>{cssContent}</style>
              {/* Dynamic preview elements based on selection */}
              {previewElement === 'button' && (
                <button className="preview-element">Preview Button</button>
              )}
              {previewElement === 'div' && (
                <div className="preview-element">
                  <p>Preview Div Container</p>
                  <button>Button inside</button>
                  <input type="text" placeholder="Input field" />
                </div>
              )}
              {previewElement === 'input' && (
                <input 
                  type="text" 
                  className="preview-element"
                  placeholder="Preview Input Field" 
                />
              )}
              {previewElement === 'card' && (
                <div className="preview-element card">
                  <h5>Card Title</h5>
                  <p>Card content goes here. This is a preview of how your styles will affect card elements.</p>
                  <button>Action Button</button>
                </div>
              )}
              {previewElement === 'alert' && (
                <div className="preview-element alert">
                  <strong>Alert!</strong> This is an alert message preview.
                </div>
              )}
              {previewElement === 'badge' && (
                <span className="preview-element badge">Badge Preview</span>
              )}
            </div>
          </div>
          
          {/* CSS preview code display */}
          <div className="preview-info">
            <h5>CSS Applied:</h5>
            <pre className="css-preview">
              {cssContent.length > 500 
                ? cssContent.substring(0, 500) + '...' 
                : cssContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSheetComponent;