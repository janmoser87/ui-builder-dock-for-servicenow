const updateSidePanel = async (tabId) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url) {
      chrome.runtime.sendMessage({
        type: "UPDATE_URL",
        url: tab.url,
        tabId: tab.id
      });
    }
  } catch (error) {
    console.error("Error in getting current tab:", error);
  }
};

// Reaction on switching active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateSidePanel(activeInfo.tabId);
});

// Reaction on URL change on current tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    await updateSidePanel(tabId);
  }
});

// First open listener
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel") {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === "REQUEST_INITIAL_URL") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
          port.postMessage({ type: "UPDATE_URL", url: tab.url, tabId: tab.id });
        }
      }
    });
  }
});