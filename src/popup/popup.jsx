import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import MainMenu from './components/MainMenu';
import CanvasEditor from './components/CanvasEditor';

const Popup = () => {
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Load saved screenshot from storage
    chrome.storage.local.get(['screenshotData'], (result) => {
      if (result.screenshotData) {
        setCurrentScreenshot(result.screenshotData);
        chrome.storage.local.remove(['screenshotData']);
      }
    });

    // Check if first time user
    chrome.storage.local.get(['firstTime'], (result) => {
      if (result.firstTime === undefined) {
        setShowTutorial(true);
        chrome.storage.local.set({ firstTime: false });
      }
    });
  }, []);

  const startScreenshot = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['src/content/content.js']
      }, () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'startScreenshot' });
        window.close();
      });
    });
  };

  const loadImage = (imageData) => {
    setCurrentScreenshot(imageData);
  };

  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content p-4 rounded-3 shadow-lg bg-white">
            <h4>🎉 Welcome to QuickShot Pro!</h4>
            <p className="text-muted">Get started with these features:</p>
            <ul>
              <li>Press <kbd>Ctrl+Shift+S</kbd> to capture anywhere</li>
              <li>Drag & drop images for editing</li>
              <li>Use AI-powered editing tools</li>
              <li>Share directly to social media</li>
            </ul>
            <button 
              className="btn btn-primary w-100"
              onClick={() => setShowTutorial(false)}
            >
              Let's Go!
            </button>
          </div>
        </div>
      )}

      {!currentScreenshot ? (
        <MainMenu 
          onStartScreenshot={startScreenshot}
          onLoadImage={loadImage}
        />
      ) : (
        <CanvasEditor 
          imageData={currentScreenshot}
          onBack={() => setCurrentScreenshot(null)}
        />
      )}

      {/* Quick Stats Footer */}
      <div className="stats-footer p-2 bg-dark text-white text-center small">
        <div className="d-flex justify-content-center gap-4">
          <span>🖼️ Screenshots: 0</span>
          <span>⏱️ Time Saved: 0m</span>
          <span>⭐ Rating: 5.0</span>
        </div>
      </div>
    </div>
  );
};

export default Popup;