import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { 
  Maximize2, Minus, Plus, RotateCw,
  FlipHorizontal, FlipVertical, Grid3x3,
  Type, MousePointer, Square, Circle,
  MinusCircle, Undo2, Redo2, Trash2,
  Save, Copy, Share2, Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CanvasEditor = ({ imageData, onBack }) => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#ff4757');
  const [brushWidth, setBrushWidth] = useState(5);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [textValue, setTextValue] = useState('');

  const tools = [
    { id: 'select', name: 'Select', icon: <MousePointer size={18} /> },
    { id: 'rectangle', name: 'Rectangle', icon: <Square size={18} /> },
    { id: 'circle', name: 'Circle', icon: <Circle size={18} /> },
    { id: 'line', name: 'Line', icon: <Minus size={18} /> },
    { id: 'arrow', name: 'Arrow', icon: <MinusCircle size={18} /> },
    { id: 'text', name: 'Text', icon: <Type size={18} /> },
    { id: 'brush', name: 'Brush', icon: '🖌️' },
    { id: 'grid', name: 'Grid', icon: <Grid3x3 size={18} /> }
  ];

  useEffect(() => {
    if (imageData && canvasRef.current) {
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
      });

      fabric.Image.fromURL(imageData, (img) => {
        const scale = Math.min(
          800 / img.width,
          600 / img.height
        );
        img.scale(scale);
        
        fabricCanvas.current.setWidth(img.width * scale);
        fabricCanvas.current.setHeight(img.height * scale);
        fabricCanvas.current.add(img);
        fabricCanvas.current.renderAll();
        
        saveToHistory();
      });

      // Setup event listeners
      fabricCanvas.current.on('object:modified', saveToHistory);
      fabricCanvas.current.on('object:added', saveToHistory);
      fabricCanvas.current.on('object:removed', saveToHistory);
    }

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, [imageData]);

  const saveToHistory = () => {
    if (fabricCanvas.current) {
      const json = JSON.stringify(fabricCanvas.current.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      fabricCanvas.current.loadFromJSON(
        history[historyIndex - 1],
        fabricCanvas.current.renderAll.bind(fabricCanvas.current)
      );
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      fabricCanvas.current.loadFromJSON(
        history[historyIndex + 1],
        fabricCanvas.current.renderAll.bind(fabricCanvas.current)
      );
    }
  };

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId);
    
    switch(toolId) {
      case 'rectangle':
        fabricCanvas.current.isDrawingMode = false;
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushWidth,
          width: 100,
          height: 100
        });
        fabricCanvas.current.add(rect);
        break;
        
      case 'circle':
        fabricCanvas.current.isDrawingMode = false;
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushWidth
        });
        fabricCanvas.current.add(circle);
        break;
        
      case 'brush':
        fabricCanvas.current.isDrawingMode = true;
        fabricCanvas.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.current);
        fabricCanvas.current.freeDrawingBrush.color = brushColor;
        fabricCanvas.current.freeDrawingBrush.width = brushWidth;
        break;
        
      case 'text':
        const text = new fabric.IText('Double click to edit', {
          left: 100,
          top: 100,
          fill: brushColor,
          fontSize: 20,
          fontFamily: 'Arial'
        });
        fabricCanvas.current.add(text);
        fabricCanvas.current.setActiveObject(text);
        break;
        
      case 'grid':
        // Toggle grid
        break;
    }
  };

  const addArrow = () => {
    const line = new fabric.Line([50, 50, 150, 150], {
      stroke: brushColor,
      strokeWidth: brushWidth,
      fill: brushColor,
      strokeLineCap: 'round',
      selectable: true
    });
    
    // Add arrowhead
    const angle = Math.atan2(150 - 50, 150 - 50);
    const headLength = 15;
    
    const arrow = new fabric.Triangle({
      left: 150,
      top: 150,
      fill: brushColor,
      angle: angle * 180 / Math.PI,
      width: headLength,
      height: headLength
    });
    
    const group = new fabric.Group([line, arrow]);
    fabricCanvas.current.add(group);
  };

  const blurSelection = () => {
    const activeObject = fabricCanvas.current.getActiveObject();
    if (activeObject) {
      activeObject.set('filter', new fabric.Image.filters.Blur({ blur: 0.1 }));
      fabricCanvas.current.renderAll();
      toast.success('Area blurred successfully');
    }
  };

  const downloadImage = () => {
    const dataURL = fabricCanvas.current.toDataURL({
      format: 'png',
      quality: 1
    });
    
    const link = document.createElement('a');
    link.download = `quickshot-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    toast.success('Image downloaded!');
  };

  const copyToClipboard = async () => {
    try {
      const blob = await new Promise(resolve => 
        fabricCanvas.current.toBlob(resolve, 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const zoomIn = () => {
    const newZoom = zoomLevel * 1.2;
    setZoomLevel(newZoom);
    fabricCanvas.current.setZoom(newZoom);
  };

  const zoomOut = () => {
    const newZoom = zoomLevel / 1.2;
    setZoomLevel(newZoom);
    fabricCanvas.current.setZoom(newZoom);
  };

  return (
    <div className="canvas-editor-container">
      {/* Enhanced Toolbar */}
      <div className="toolbar bg-dark text-white p-2">
        <div className="d-flex align-items-center">
          {/* Navigation */}
          <button className="btn btn-outline-light me-2" onClick={onBack}>
            ← Back
          </button>

          {/* Tools */}
          <div className="btn-group me-3">
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-outline-light'}`}
                onClick={() => handleToolSelect(tool.id)}
                title={tool.name}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="me-3">
            <input
              type="color"
              className="form-control form-control-color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              title="Choose color"
            />
          </div>

          {/* Brush Size */}
          <div className="me-3" style={{ width: '100px' }}>
            <input
              type="range"
              className="form-range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
            />
          </div>

          {/* Zoom Controls */}
          <div className="btn-group me-3">
            <button className="btn btn-outline-light" onClick={zoomOut}>
              <Minus size={16} />
            </button>
            <span className="btn btn-outline-light">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button className="btn btn-outline-light" onClick={zoomIn}>
              <Plus size={16} />
            </button>
            <button className="btn btn-outline-light" onClick={() => {
              setZoomLevel(1);
              fabricCanvas.current.setZoom(1);
            }}>
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="ms-auto btn-group">
            <button className="btn btn-outline-light" onClick={undo}>
              <Undo2 size={16} />
            </button>
            <button className="btn btn-outline-light" onClick={redo}>
              <Redo2 size={16} />
            </button>
            <button className="btn btn-outline-light" onClick={addArrow}>
              ➚
            </button>
            <button className="btn btn-outline-warning" onClick={blurSelection}>
              Blur
            </button>
            <button className="btn btn-danger" onClick={() => {
              fabricCanvas.current.getActiveObject()?.remove();
            }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="canvas-wrapper p-3 bg-secondary bg-opacity-10">
        <canvas
          ref={canvasRef}
          className="border rounded shadow-lg"
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar bg-light p-3 border-top">
        <div className="d-flex justify-content-between align-items-center">
          <div className="btn-group">
            <button 
              className="btn btn-success"
              onClick={downloadImage}
            >
              <Save size={16} className="me-2" />
              Save Image
            </button>
            <button 
              className="btn btn-info"
              onClick={copyToClipboard}
            >
              <Copy size={16} className="me-2" />
              Copy
            </button>
            <button 
              className="btn btn-warning"
              onClick={() => toast.success('Sharing feature coming soon!')}
            >
              <Share2 size={16} className="me-2" />
              Share
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload size={16} className="me-2" />
              Upload
            </button>
          </div>

          <div className="text-muted small">
            <RotateCw size={14} className="me-1" />
            Auto-save enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;