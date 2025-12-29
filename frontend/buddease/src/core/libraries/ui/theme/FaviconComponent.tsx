// components/branding/FaviconComponent.tsx

"use client";

import { generateFavicon, uploadFile } from '@/core/services/fileService';
import React, { useEffect, useRef, useState } from 'react';

interface FaviconComponentProps {
  initialFavicon?: string;
  onFaviconChange?: (faviconData: string) => void;
  generateAllSizes?: boolean;
  allowUpload?: boolean;
}

const FaviconComponent: React.FC<FaviconComponentProps> = ({
  initialFavicon = '',
  onFaviconChange,
  generateAllSizes = true,
  allowUpload = true
}) => {
  const [faviconImage, setFaviconImage] = useState<string>(initialFavicon);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewSize, setPreviewSize] = useState<'16x16' | '32x32' | '48x48' | '64x64'>('32x32');
  const [customSize, setCustomSize] = useState({ width: 32, height: 32 });
  const [generatedSizes, setGeneratedSizes] = useState<Array<{ size: string; data: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [faviconCode, setFaviconCode] = useState<string>('');
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Standard favicon sizes
  const standardSizes = [
    { size: '16x16', description: 'Standard favicon size' },
    { size: '32x32', description: 'High-resolution favicon' },
    { size: '48x48', description: 'Windows shortcut icon' },
    { size: '64x64', description: 'Desktop icon' },
    { size: '128x128', description: 'Chrome Web Store' },
    { size: '180x180', description: 'Apple Touch Icon' },
    { size: '192x192', description: 'Android Chrome' },
    { size: '512x512', description: 'High-resolution icon' }
  ];

  useEffect(() => {
    if (faviconImage) {
      generateFaviconCode();
      if (!imageHistory.includes(faviconImage)) {
        setImageHistory(prev => [...prev, faviconImage].slice(-5)); // Keep last 5
      }
    }
  }, [faviconImage]);

  useEffect(() => {
    if (faviconImage && canvasRef.current) {
      drawPreview();
    }
  }, [faviconImage, previewSize, customSize]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setFaviconImage(base64Image);
        onFaviconChange?.(base64Image);
        setUploading(false);
      };
      reader.readAsDataURL(file);

      // Also upload to server if needed
      await uploadFile(file, 'favicons');
    } catch (err) {
      setError('Failed to upload image');
      setUploading(false);
    }
  };

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !faviconImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions
      const [width, height] = previewSize.split('x').map(Number);
      canvas.width = width;
      canvas.height = height;

      // Draw image with proper scaling
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = faviconImage;
  };

  const generateFaviconCode = () => {
    if (!faviconImage) return;

    const sizes = generateAllSizes 
      ? standardSizes.map(s => s.size)
      : ['32x32'];

    const code = `<!-- Favicon Code -->
<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconImage.split(',')[1]}" />

<!-- For different sizes -->
${sizes.map(size => {
  const [width, height] = size.split('x').map(Number);
  return `<link rel="icon" type="image/png" sizes="${size}" href="/favicon-${size}.png">`;
}).join('\n')}

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Manifest for PWA -->
<link rel="manifest" href="/site.webmanifest">

<!-- For HTML -->
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">`;

    setFaviconCode(code);
  };

  const handleGenerateAllSizes = async () => {
    if (!faviconImage) {
      setError('Please upload an image first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const sizes = standardSizes.map(s => s.size);
      const generated = await Promise.all(
        sizes.map(async (size) => {
          const [width, height] = size.split('x').map(Number);
          const data = await generateFavicon(faviconImage, width, height);
          return { size, data };
        })
      );

      setGeneratedSizes(generated);
      setGenerating(false);
    } catch (err) {
      setError('Failed to generate favicon sizes');
      setGenerating(false);
    }
  };

  const handleDownload = (size: string, data: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = `favicon-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    generatedSizes.forEach(({ size, data }) => {
      const link = document.createElement('a');
      link.href = data;
      link.download = `favicon-${size}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(faviconCode)
      .then(() => alert('Favicon code copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleHistorySelect = (image: string) => {
    setFaviconImage(image);
    onFaviconChange?.(image);
  };

  const handleGenerateFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setFaviconImage(dataUrl);
    onFaviconChange?.(dataUrl);
  };

  const clearFavicon = () => {
    setFaviconImage('');
    setGeneratedSizes([]);
    setFaviconCode('');
    onFaviconChange?.('');
  };

  return (
    <div className="favicon-component">
      <div className="favicon-header">
        <h3>Favicon Manager</h3>
        <p className="description">
          Upload, preview, and generate favicons for your application
        </p>
      </div>

      {/* Upload Section */}
      {allowUpload && (
        <div className="upload-section">
          <div className="upload-area">
            {!faviconImage ? (
              <div 
                className="upload-prompt"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📁</div>
                <p>Click to upload favicon image</p>
                <p className="upload-hint">PNG, JPG, SVG (Max 2MB)</p>
              </div>
            ) : (
              <div className="image-preview">
                <img 
                  src={faviconImage} 
                  alt="Favicon preview" 
                  className="preview-image"
                />
                <div className="image-actions">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                  >
                    Change Image
                  </button>
                  <button 
                    onClick={clearFavicon}
                    className="btn btn-warning"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {uploading && (
              <div className="uploading-overlay">
                <div className="loading-spinner"></div>
                <p>Uploading...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Preview and Generation */}
      {faviconImage && (
        <div className="favicon-content">
          <div className="preview-section">
            <h4>Preview</h4>
            <div className="preview-controls">
              <div className="size-controls">
                <label>Preview Size:</label>
                <select
                  value={previewSize}
                  onChange={(e) => setPreviewSize(e.target.value as any)}
                  className="form-select"
                >
                  <option value="16x16">16x16</option>
                  <option value="32x32">32x32</option>
                  <option value="48x48">48x48</option>
                  <option value="64x64">64x64</option>
                </select>
                
                <div className="custom-size">
                  <label>Custom:</label>
                  <input
                    type="number"
                    value={customSize.width}
                    onChange={(e) => setCustomSize(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value) || 32 
                    }))}
                    className="size-input"
                    min="16"
                    max="512"
                  />
                  <span>×</span>
                  <input
                    type="number"
                    value={customSize.height}
                    onChange={(e) => setCustomSize(prev => ({ 
                      ...prev, 
                      height: parseInt(e.target.value) || 32 
                    }))}
                    className="size-input"
                    min="16"
                    max="512"
                  />
                  <button 
                    onClick={() => setPreviewSize(`${customSize.width}x${customSize.height}`)}
                    className="btn btn-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="canvas-preview">
              <canvas 
                ref={canvasRef} 
                className="favicon-canvas"
              />
              <div className="canvas-info">
                <p>Size: {previewSize} pixels</p>
                <button 
                  onClick={handleGenerateFromCanvas}
                  className="btn btn-primary"
                >
                  Generate from Canvas
                </button>
              </div>
            </div>
          </div>

          {/* Generate All Sizes */}
          <div className="generation-section">
            <h4>Generate Favicon Sizes</h4>
            <p className="description">
              Generate all necessary favicon sizes for different devices and browsers
            </p>
            
            <button 
              onClick={handleGenerateAllSizes}
              disabled={generating}
              className="btn btn-primary generate-btn"
            >
              {generating ? 'Generating...' : 'Generate All Sizes'}
            </button>

            {generatedSizes.length > 0 && (
              <div className="generated-sizes">
                <h5>Generated Sizes:</h5>
                <div className="size-grid">
                  {generatedSizes.map(({ size, data }) => (
                    <div key={size} className="size-item">
                      <img 
                        src={data} 
                        alt={`Favicon ${size}`}
                        className="size-preview"
                      />
                      <div className="size-info">
                        <span className="size-label">{size}</span>
                        <button 
                          onClick={() => handleDownload(size, data)}
                          className="btn btn-sm download-btn"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bulk-actions">
                  <button 
                    onClick={handleDownloadAll}
                    className="btn btn-secondary"
                  >
                    Download All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Favicon Code */}
          <div className="code-section">
            <h4>Favicon HTML Code</h4>
            <div className="code-actions">
              <button 
                onClick={handleCopyCode}
                className="btn btn-primary"
                disabled={!faviconCode}
              >
                Copy Code
              </button>
            </div>
            
            <pre className="favicon-code">
              {faviconCode || '// Upload an image to generate favicon code'}
            </pre>
          </div>

          {/* Image History */}
          {imageHistory.length > 1 && (
            <div className="history-section">
              <h4>Recent Images</h4>
              <div className="history-grid">
                {imageHistory.map((image, index) => (
                  <div 
                    key={index}
                    className="history-item"
                    onClick={() => handleHistorySelect(image)}
                  >
                    <img 
                      src={image} 
                      alt={`History ${index + 1}`}
                      className="history-preview"
                    />
                    <div className="history-overlay">
                      <span>Select</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="tips-section">
            <h4>Usage Tips</h4>
            <div className="tips-list">
              <div className="tip-item">
                <strong>Standard Favicon:</strong> Use 32x32 for most browsers
              </div>
              <div className="tip-item">
                <strong>Apple Devices:</strong> 180x180 for iOS devices
              </div>
              <div className="tip-item">
                <strong>High Resolution:</strong> 512x512 for high-DPI displays
              </div>
              <div className="tip-item">
                <strong>File Format:</strong> PNG for transparency, ICO for legacy support
              </div>
              <div className="tip-item">
                <strong>Best Practices:</strong> Keep it simple, recognizable at small sizes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Image State */}
      {!faviconImage && (
        <div className="no-image-state">
          <div className="no-image-icon">🎨</div>
          <h4>No Favicon Selected</h4>
          <p>Upload an image to get started with favicon generation</p>
          {allowUpload && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              Upload Image
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FaviconComponent;