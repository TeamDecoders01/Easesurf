chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'OPEN_EXTENSION_UI') {
        // Opens a new popup window with the extension's UI (e.g., index.html)
        chrome.windows.create({
            url: chrome.runtime.getURL('index.html'),
            type: 'popup',
            width: 400,
            height: 600,
        });
        sendResponse({ status: 'opened' });
    }
});
