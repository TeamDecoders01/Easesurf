import { applySimplifiedUIMode } from './scripts/ui';

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'UPDATE_FONT_SIZE' && message.fontSize) {
        applySimplifiedUIMode(message.fontSize);
        sendResponse({ status: 'success' });
    }
});
