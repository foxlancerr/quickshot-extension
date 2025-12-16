import React from 'react';
import { Circle, Palette, Droplets } from 'lucide-react';

const ColorPicker = ({ color, onChange }) => {
  const colorPalettes = {
    'Primary': ['#0d6efd', '#6610f2', '#6f42c1', '#d63384'],
    'Success': ['#198754', '#20c997', '#3ddc97', '#0acf83'],
    'Warning': ['#ffc107', '#fd7e14', '#ff6b35', '#ff9a76'],
    'Danger': ['#dc3545', '#ff4757', '#ff6b6b', '#ff8787'],
    'Neutral': ['#6c757d', '#adb5bd', '#ced4da', '#f8f9fa'],
    'Gradients': ['#667eea', '#764ba2', '#f093fb', '#f5576c']
  };

  const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  ];

  return (
    <div className="color-picker-popup p-3 rounded-3 shadow-lg bg-white">
      <div className="d-flex align-items-center mb-3">
        <Palette className="me-2" />
        <h6 className="mb-0">Color Palette</h6>
      </div>

      {/* Current Color Preview */}
      <div className="current-color mb-3 p-3 rounded text-center">
        <div 
          className="color-preview mx-auto mb-2 rounded-circle"
          style={{ 
            backgroundColor: color,
            width: '60px',
            height: '60px',
            border: '3px solid #dee2e6'
          }}
        />
        <code className="small">{color}</code>
      </div>

      {/* Color Palettes */}
      {Object.entries(colorPalettes).map(([name, colors]) => (
        <div key={name} className="mb-3">
          <small className="text-muted d-block mb-2">{name}</small>
          <div className="d-flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                className="color-swatch rounded-circle border-0"
                style={{ 
                  backgroundColor: c,
                  width: '30px',
                  height: '30px'
                }}
                onClick={() => onChange(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Gradient Colors */}
      <div className="mb-3">
        <div className="d-flex align-items-center mb-2">
          <Droplets size={14} className="me-2" />
          <small className="text-muted">Gradients</small>
        </div>
        <div className="row g-2">
          {gradientColors.map((gradient, index) => (
            <div key={index} className="col-6">
              <button
                className="gradient-swatch w-100 rounded border-0"
                style={{ 
                  background: gradient,
                  height: '40px'
                }}
                onClick={() => onChange(gradient)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      <div>
        <small className="text-muted d-block mb-2">Custom Color</small>
        <div className="input-group">
          <span className="input-group-text">#</span>
          <input
            type="text"
            className="form-control"
            value={color.replace('#', '')}
            onChange={(e) => onChange('#' + e.target.value)}
            placeholder="Enter hex color"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;