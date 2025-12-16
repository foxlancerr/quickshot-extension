// background.js - Service Worker for Manifest V3
console.log("QuickShot background service worker started");

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("QuickShot extension installed");
  
  // Create context menu (requires "contextMenus" permission)
  try {
    chrome.contextMenus.create({
      id: "capture-area",
      title: "Capture Area with QuickShot",
      contexts: ["page"]
    });
  } catch (error) {
    console.log("Context menus not available:", error.message);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "capture-area") {
    chrome.tabs.sendMessage(tab.id, { action: "startScreenshot" });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      switch (command) {
        case "capture-visible":
          chrome.tabs.sendMessage(tabs[0].id, { action: "captureVisible" });
          break;
        case "capture-full":
          chrome.tabs.sendMessage(tabs[0].id, { action: "captureFull" });
          break;
        case "_execute_action":
          // This automatically opens the popup
          break;
      }
    }
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);
  
  if (message.action === "saveScreenshot") {
    // Handle screenshot saving
    chrome.downloads.download({
      url: message.data,
      filename: `screenshot-${Date.now()}.png`
    });
  }
  
  return true; // Keep message channel open for async responses
});

// Keep service worker alive
let keepAliveInterval;

function keepAlive() {
  keepAliveInterval = setInterval(() => {
    // Send a ping to keep service worker alive
    console.log("QuickShot service worker ping");
  }, 20000); // Ping every 20 seconds
}

// Start keep-alive
keepAlive();

// Handle service worker shutdown
self.onunload = () => {
  clearInterval(keepAliveInterval);
};