import React, { useState } from 'react';
import { 
  Camera, Zap, Sparkles,  
  Share2,  Copy, Star,
  Settings, History, HelpCircle,
  Cloud
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MainMenu = ({ onStartScreenshot, onLoadImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const features = [
    { icon: <Zap size={20} />, text: "Blazing Fast Capture", color: "text-warning" },
    { icon: <Sparkles size={20} />, text: "AI-Powered Editing", color: "text-info" },
    { icon: <Share2 size={20} />, text: "One-Click Sharing", color: "text-success" },
    { icon: <Copy size={20} />, text: "Instant Copy to Clipboard", color: "text-primary" }
  ];

  const recentTools = [
    "Rectangle Area Capture",
    "Text Annotation",
    "Arrow & Line Tools",
    "Blur Sensitive Info",
    "Numbering & Lists"
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onLoadImage(event.target.result);
      };
      reader.readAsDataURL(file);
      toast.success('Image loaded successfully!');
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onLoadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="main-menu-container p-4">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="position-relative d-inline-block">
          <div className="p-3 rounded-circle bg-gradient-primary shadow-lg">
            <Camera size={48} className="text-white" />
          </div>
          <div className="position-absolute top-0 start-100 translate-middle">
            <div className="badge bg-danger rounded-pill pulse-animation">
              PRO
            </div>
          </div>
        </div>
        <h1 className="mt-4 fw-bold gradient-text">QuickShot Pro</h1>
        <p className="text-muted">Professional screenshot tool with advanced editing</p>
      </div>

      {/* Main Action Button */}
      <div className="mb-4">
        <button 
          className="btn btn-primary btn-lg w-100 py-3 shadow-lg hover-lift"
          onClick={onStartScreenshot}
        >
          <Camera className="me-2" />
          Capture Screenshot
          <span className="badge bg-light text-primary ms-2">Ctrl+Shift+S</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        className={`drop-zone p-5 mb-4 rounded-3 text-center border-3 ${isDragging ? 'border-primary bg-primary-soft' : 'border-dashed'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderStyle: isDragging ? 'solid' : 'dashed',
          background: isDragging ? 'rgba(13, 110, 253, 0.1)' : 'transparent'
        }}
      >
        <Cloud size={48} className="mb-3 text-muted" />
        <h5>Drag & Drop Image</h5>
        <p className="text-muted small mb-3">or click to upload</p>
        <input
          type="file"
          id="file-upload"
          className="d-none"
          accept="image/*"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className="btn btn-outline-primary">
          Browse Files
        </label>
      </div>

      {/* Features Grid */}
      <div className="row row-cols-2 g-3 mb-4">
        {features.map((feature, index) => (
          <div key={index} className="col">
            <div className="feature-card p-3 rounded-3 bg-light hover-lift">
              <div className={`mb-2 ${feature.color}`}>
                {feature.icon}
              </div>
              <small className="fw-medium">{feature.text}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tools */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3">
          <History size={18} className="me-2" />
          Recently Used Tools
        </h6>
        <div className="d-flex flex-wrap gap-2">
          {recentTools.map((tool, index) => (
            <span key={index} className="badge bg-light text-dark border py-2 px-3">
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="border-top pt-3">
        <div className="row g-2">
          <div className="col">
            <button className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center">
              <Settings size={16} className="me-2" />
              Settings
            </button>
          </div>
          <div className="col">
            <button className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center">
              <HelpCircle size={16} className="me-2" />
              Help
            </button>
          </div>
          <div className="col">
            <button className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center">
              <Star size={16} className="me-2" />
              Rate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;