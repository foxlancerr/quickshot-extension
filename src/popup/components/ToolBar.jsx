import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Download, Copy, Share2, 
  Trash2, Undo2, Redo2, Type,
  Square, Circle, Minus, MousePointer,
  MinusCircle, Grid3x3, Brush, Palette,
  Save, Upload, Settings, Maximize2,
  Minimize2, ZoomIn, ZoomOut, RotateCw,
  Image, Link, Smile, Hash,
  Blur, Crop, Scissors, Eye,
  EyeOff, Clock, Star, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ColorPicker from './ColorPicker';

const Toolbar = ({ 
  activeTool, 
  onToolChange, 
  onColorChange, 
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onDownload,
  onCopy,
  onShare,
  onLoadImage,
  zoom,
  onZoomChange,
  color,
  brushSize,
  canvasRef
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [toolHistory, setToolHistory] = useState([]);
  const [favoriteTools, setFavoriteTools] = useState(['rectangle', 'arrow', 'brush']);
  const colorPickerRef = useRef(null);

  const tools = [
    { id: 'select', name: 'Select', icon: <MousePointer size={18} />, shortcut: 'V' },
    { id: 'rectangle', name: 'Rectangle', icon: <Square size={18} />, shortcut: 'R' },
    { id: 'circle', name: 'Circle', icon: <Circle size={18} />, shortcut: 'C' },
    { id: 'line', name: 'Line', icon: <Minus size={18} />, shortcut: 'L' },
    { id: 'arrow', name: 'Arrow', icon: <MinusCircle size={18} />, shortcut: 'A' },
    { id: 'text', name: 'Text', icon: <Type size={18} />, shortcut: 'T' },
    { id: 'brush', name: 'Brush', icon: <Brush size={18} />, shortcut: 'B' },
    { id: 'highlighter', name: 'Highlighter', icon: <Brush size={18} />, shortcut: 'H' },
    { id: 'blur', name: 'Blur', icon: <Blur size={18} />, shortcut: 'U' },
    { id: 'crop', name: 'Crop', icon: <Crop size={18} />, shortcut: 'P' },
    { id: 'sticker', name: 'Sticker', icon: <Smile size={18} />, shortcut: 'S' },
    { id: 'grid', name: 'Grid', icon: <Grid3x3 size={18} />, shortcut: 'G' },
    { id: 'number', name: 'Number', icon: <Hash size={18} />, shortcut: 'N' }
  ];

  const quickColors = [
    '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
    '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
    '#8E8E93', '#AEAEB2', '#C7C7CC', '#D1D1D6',
    '#000000', '#FFFFFF'
  ];

  const presets = [
    { name: 'Annotation', tools: ['rectangle', 'arrow', 'text'] },
    { name: 'Redaction', tools: ['blur', 'rectangle'] },
    { name: 'Tutorial', tools: ['arrow', 'number', 'text'] },
    { name: 'Creative', tools: ['brush', 'sticker', 'highlighter'] }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (toolId) => {
    onToolChange(toolId);
    
    // Add to history
    setToolHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length >= 10) newHistory.shift();
      newHistory.push(toolId);
      return newHistory;
    });

    // If text tool is selected, show text input
    if (toolId === 'text') {
      setShowTextInput(true);
      setTimeout(() => {
        document.getElementById('text-input')?.focus();
      }, 100);
    } else {
      setShowTextInput(false);
    }

    // Show tooltip
    const tool = tools.find(t => t.id === toolId);
    toast.success(`${tool.name} tool activated`);
  };

  const handleColorSelect = (selectedColor) => {
    onColorChange(selectedColor);
    setShowColorPicker(false);
    toast.success(`Color changed to ${selectedColor}`);
  };

  const handlePresetClick = (preset) => {
    // Activate first tool from preset
    if (preset.tools.length > 0) {
      handleToolClick(preset.tools[0]);
    }
    toast.success(`${preset.name} preset loaded`);
  };

  const handleFavoriteToggle = (toolId) => {
    setFavoriteTools(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };

  const handleScreenshot = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startScreenshot' });
      window.close();
    });
  };

  const addSticker = (emoji) => {
    if (canvasRef.current) {
      // Add sticker to canvas
      toast.success(`Added ${emoji} sticker`);
    }
  };

  const stickers = ['👍', '⭐', '💡', '⚠️', '❓', '✅', '❌', '🎯'];

  return (
    <div className="toolbar-container">
      {/* Main Toolbar */}
      <div className="main-toolbar bg-dark text-white p-2 shadow-lg">
        <div className="container-fluid">
          {/* Row 1: Primary Tools */}
          <div className="row align-items-center mb-2">
            <div className="col-auto">
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={handleScreenshot}
                title="New Screenshot (Ctrl+Shift+S)"
              >
                <Camera size={16} className="me-1" />
                New
              </button>
            </div>

            <div className="col">
              <div className="d-flex flex-wrap gap-1">
                {/* Recent Tools */}
                {toolHistory.slice(-4).reverse().map((toolId, index) => {
                  const tool = tools.find(t => t.id === toolId);
                  return tool ? (
                    <button
                      key={`recent-${index}`}
                      className={`btn btn-sm ${activeTool === toolId ? 'btn-primary' : 'btn-outline-light'}`}
                      onClick={() => handleToolClick(toolId)}
                      title={`Recently used: ${tool.name}`}
                    >
                      {tool.icon}
                    </button>
                  ) : null;
                })}

                {/* Favorite Tools */}
                {favoriteTools.map(toolId => {
                  const tool = tools.find(t => t.id === toolId);
                  return tool ? (
                    <button
                      key={`fav-${toolId}`}
                      className={`btn btn-sm ${activeTool === toolId ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => handleToolClick(toolId)}
                      title={`Favorite: ${tool.name}`}
                    >
                      {tool.icon}
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            <div className="col-auto">
              <div className="btn-group">
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={onUndo}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={onRedo}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={16} />
                </button>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={onClear}
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Tool Selection & Color */}
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                {/* Tool Selection */}
                <div className="tools-scrollable me-3">
                  <div className="d-flex gap-1">
                    {tools.map(tool => (
                      <button
                        key={tool.id}
                        className={`btn btn-sm ${activeTool === tool.id ? 'btn-light' : 'btn-outline-light'}`}
                        onClick={() => handleToolClick(tool.id)}
                        title={`${tool.name} (${tool.shortcut})`}
                      >
                        <div className="d-flex flex-column align-items-center">
                          {tool.icon}
                          <small className="text-muted">{tool.shortcut}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="position-relative" ref={colorPickerRef}>
                  <button
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Color Picker"
                  >
                    <div 
                      className="color-preview rounded-circle d-inline-block me-1"
                      style={{ 
                        backgroundColor: color,
                        width: '16px',
                        height: '16px',
                        border: '1px solid white'
                      }}
                    />
                    <Palette size={14} />
                  </button>

                  {showColorPicker && (
                    <div className="color-picker-popup position-absolute start-0 top-100 mt-1 z-3">
                      <ColorPicker color={color} onChange={handleColorSelect} />
                    </div>
                  )}
                </div>

                {/* Quick Colors */}
                <div className="quick-colors me-3">
                  <div className="d-flex gap-1">
                    {quickColors.map((col, idx) => (
                      <button
                        key={idx}
                        className="color-chip border-0 rounded-circle"
                        style={{ 
                          backgroundColor: col,
                          width: '20px',
                          height: '20px',
                          border: color === col ? '2px solid white' : '1px solid #666'
                        }}
                        onClick={() => handleColorSelect(col)}
                        title={col}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex justify-content-end gap-2">
                {/* Zoom Controls */}
                <div className="btn-group">
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => onZoomChange(zoom * 0.8)}
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="btn btn-outline-light btn-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => onZoomChange(zoom * 1.2)}
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => onZoomChange(1)}
                    title="Reset Zoom"
                  >
                    <RotateCw size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar - Context Sensitive */}
      <div className="secondary-toolbar bg-light border-bottom p-2">
        <div className="container-fluid">
          {activeTool === 'text' && showTextInput && (
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    id="text-input"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && textInput.trim()) {
                        // Add text to canvas
                        toast.success('Text added to canvas');
                        setTextInput('');
                      }
                    }}
                  />
                  <button className="btn btn-primary btn-sm">
                    Add Text
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex gap-2 align-items-center">
                  <small className="text-muted">Font Size:</small>
                  <input
                    type="range"
                    className="form-range"
                    style={{ width: '100px' }}
                    min="12"
                    max="72"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
                  />
                  <small>{brushSize}px</small>
                </div>
              </div>
            </div>
          )}

          {activeTool === 'brush' && (
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3">
                  <small className="text-muted">Brush Size: {brushSize}px</small>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
                  />
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary">
                      Soft
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Hard
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      Calligraphy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTool === 'sticker' && (
            <div className="sticker-picker">
              <div className="d-flex gap-2">
                {stickers.map((sticker, idx) => (
                  <button
                    key={idx}
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => addSticker(sticker)}
                  >
                    {sticker}
                  </button>
                ))}
                <button className="btn btn-outline-primary">
                  <Smile size={18} className="me-1" />
                  More Stickers
                </button>
              </div>
            </div>
          )}

          {/* Presets Quick Access */}
          <div className="presets mt-2">
            <small className="text-muted me-2">Presets:</small>
            <div className="d-flex gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar bg-white border-bottom p-2">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <button 
                className="btn btn-success btn-sm"
                onClick={onDownload}
                title="Save Image (Ctrl+S)"
              >
                <Download size={16} className="me-1" />
                Save
              </button>
              <button 
                className="btn btn-info btn-sm"
                onClick={onCopy}
                title="Copy to Clipboard (Ctrl+C)"
              >
                <Copy size={16} className="me-1" />
                Copy
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={onShare}
                title="Share (Ctrl+Shift+P)"
              >
                <Share2 size={16} className="me-1" />
                Share
              </button>
              <input
                type="file"
                id="image-upload"
                className="d-none"
                accept="image/*"
                onChange={onLoadImage}
              />
              <label htmlFor="image-upload" className="btn btn-primary btn-sm">
                <Upload size={16} className="me-1" />
                Upload
              </label>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm">
                <Settings size={14} className="me-1" />
                Settings
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <Clock size={14} className="me-1" />
                History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;