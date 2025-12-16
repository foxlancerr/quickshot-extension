import React from 'react';
import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Popup from './popup';
import './Popup.css';

// Initialize React app
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

// Error boundary for the extension
window.addEventListener('error', (event) => {
  console.error('Extension error:', event.error);
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'screenshotTaken') {
    // Reload the popup to show editor
    window.location.reload();
  }
});