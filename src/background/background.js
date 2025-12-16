// background.js - Enhanced with screenshot handling
console.log("QuickShot background service worker started");

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("QuickShot extension installed");
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case "_execute_action":
          // Opens popup automatically
          break;
        case "capture-visible":
          chrome.tabs.sendMessage(tabs[0].id, { action: "captureVisible" });
          break;
        case "capture-full":
          chrome.tabs.sendMessage(tabs[0].id, { action: "captureFull" });
          break;
      }
    }
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message.action);
  
  switch (message.action) {
    case "screenshotCaptured":
      // Screenshot was captured, store it
      chrome.storage.local.set({ 
        screenshotData: message.data,
        lastCaptureTime: Date.now()
      });
      
      // Open popup to show editor
      chrome.action.openPopup();
      break;
      
    case "openEditor":
      // Open popup to show editor
      chrome.action.openPopup();
      break;
      
    case "captureVisibleTab":
      // Capture visible tab with cropping
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error('Capture error:', chrome.runtime.lastError);
          return;
        }
        
        // If crop is specified, crop the image
        if (message.crop) {
          cropImage(dataUrl, message.crop).then(croppedDataUrl => {
            chrome.storage.local.set({ screenshotData: croppedDataUrl });
            chrome.action.openPopup();
          });
        } else {
          chrome.storage.local.set({ screenshotData: dataUrl });
          chrome.action.openPopup();
        }
      });
      break;
      
    case "saveScreenshot":
      // Handle screenshot saving to file
      saveScreenshotToFile(message.data, message.filename);
      break;
  }
  
  return true;
});

// Function to crop image (simplified version)
async function cropImage(dataUrl, crop) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

// Function to save screenshot to file
function saveScreenshotToFile(dataUrl, filename = `screenshot-${Date.now()}.png`) {
  // Convert base64 to blob
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const blob = new Blob([u8arr], { type: mime });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download failed:', chrome.runtime.lastError);
    } else {
      console.log('Download started:', downloadId);
    }
    
    // Clean up URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Keep service worker alive
setInterval(() => {
  console.log("QuickShot service worker alive");
}, 30000);