import React, { useState, useEffect } from "react";

import IndexPopup from "./popup"

function SidePanel() {
    const [currentUrl, setCurrentUrl] = useState("Loading...");

    useEffect(() => {
        const messageListener = (request, sender, sendResponse) => {
            if (request.type === "UPDATE_URL" && request.url) {
                setCurrentUrl(request.url);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        (async () => {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0 && tabs[0].url) {
                setCurrentUrl(tabs[0].url);
            }
        })();

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    return (
        <IndexPopup url={currentUrl} isInSidepanel={true} />
    );
}

export default SidePanel;