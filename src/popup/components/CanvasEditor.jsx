import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Maximize2, Minus, Plus, RotateCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Toolbar from './ToolBar';


const CanvasEditor = ({ imageData, onBack }) => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [brushColor, setBrushColor] = useState('#ff4757');
  const [brushSize, setBrushSize] = useState(5);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (imageData && canvasRef.current) {
      // Initialize fabric canvas
      fabricCanvas.current = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#ffffff'
      });

      // Load image
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
      });
    }

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose();
      }
    };
  }, [imageData]);

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    
    if (!fabricCanvas.current) return;

    switch (toolId) {
      case 'rectangle':
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushSize,
          width: 100,
          height: 100
        });
        fabricCanvas.current.add(rect);
        break;
        
      case 'circle':
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushSize
        });
        fabricCanvas.current.add(circle);
        break;
        
      case 'brush':
        fabricCanvas.current.isDrawingMode = true;
        fabricCanvas.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.current);
        fabricCanvas.current.freeDrawingBrush.color = brushColor;
        fabricCanvas.current.freeDrawingBrush.width = brushSize;
        break;
        
      case 'text':
        const text = new fabric.IText('Double click to edit', {
          left: 100,
          top: 100,
          fill: brushColor,
          fontSize: 20
        });
        fabricCanvas.current.add(text);
        break;
    }
  };

  const handleUndo = () => {
    // Simple undo - remove last object
    const objects = fabricCanvas.current.getObjects();
    if (objects.length > 1) { // Keep the base image
      const lastObject = objects[objects.length - 1];
      fabricCanvas.current.remove(lastObject);
    }
  };

  const handleRedo = () => {
    // Redo logic would need history tracking
    toast.info('Redo feature coming soon');
  };

  const handleClear = () => {
    if (fabricCanvas.current) {
      // Remove all objects except the base image
      const objects = fabricCanvas.current.getObjects();
      objects.forEach((obj, index) => {
        if (index > 0) { // Keep first object (base image)
          fabricCanvas.current.remove(obj);
        }
      });
      fabricCanvas.current.renderAll();
    }
  };

  const handleDownload = () => {
    if (fabricCanvas.current) {
      const dataURL = fabricCanvas.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      const link = document.createElement('a');
      link.download = `quickshot-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      toast.success('Image downloaded!');
    }
  };

  const handleCopy = async () => {
    if (fabricCanvas.current) {
      try {
        const blob = await new Promise(resolve => 
          fabricCanvas.current.toBlob(resolve, 'image/png')
        );
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy: ' + err.message);
      }
    }
  };

  const handleShare = () => {
    toast.info('Share feature coming soon');
  };

  const handleLoadImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Load new image
        fabric.Image.fromURL(e.target.result, (img) => {
          fabricCanvas.current.clear();
          fabricCanvas.current.add(img);
          fabricCanvas.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    if (fabricCanvas.current) {
      fabricCanvas.current.setZoom(newZoom);
      fabricCanvas.current.renderAll();
    }
  };

  return (
    <div className="canvas-editor-container d-flex flex-column h-100">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onColorChange={setBrushColor}
        onBrushSizeChange={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onShare={handleShare}
        onLoadImage={handleLoadImage}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        color={brushColor}
        brushSize={brushSize}
        canvasRef={fabricCanvas}
      />
      
      <div className="canvas-wrapper flex-grow-1 p-3 bg-secondary bg-opacity-10 overflow-auto">
        <div className="d-flex justify-content-center align-items-center h-100">
          <canvas
            ref={canvasRef}
            className="border rounded shadow"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              cursor: activeTool === 'select' ? 'default' : 'crosshair'
            }}
          />
        </div>
      </div>
      
      <div className="action-footer p-2 bg-light border-top">
        <div className="d-flex justify-content-between align-items-center">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onBack}
          >
            ← Back to Menu
          </button>
          <div className="text-muted small">
            <RotateCw size={14} className="me-1" />
            QuickShot Pro Editor
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;