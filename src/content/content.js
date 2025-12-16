// content.js - Content script
console.log("QuickShot content script loaded");

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received:", message);
  
  switch (message.action) {
    case "startScreenshot":
      startScreenshot();
      break;
    case "captureVisible":
      captureVisible();
      break;
    case "captureFull":
      captureFull();
      break;
  }
  
  return true;
});

function startScreenshot() {
  console.log("Starting screenshot mode...");
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999999;
    cursor: crosshair;
  `;
  
  document.body.appendChild(overlay);
  
  // Simple screenshot logic
  overlay.addEventListener('click', () => {
    overlay.remove();
    alert('QuickShot: Screenshot mode activated!');
  });
}

function captureVisible() {
  console.log("Capturing visible area...");
  // Use chrome.tabs.captureVisibleTab for visible area
  chrome.runtime.sendMessage({ 
    action: "saveScreenshot", 
    data: "data:image/png;base64,..." 
  });
}

function captureFull() {
  console.log("Capturing full page...");
  // Full page capture logic
}