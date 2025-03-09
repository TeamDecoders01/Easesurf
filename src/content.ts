import { startAutoScroll, stopAutoScroll } from './scripts/AutoScroll';
import { applySimplifiedUIMode } from './scripts/ui';

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    console.log('Content script received:', request);
    if (request.action === 'startScroll') {
        startAutoScroll();
    } else if (request.action === 'stopScroll') {
        stopAutoScroll();
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection()?.toString() || '';
        sendResponse({ text: selectedText });
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'updateFontSize' && request.fontSize) {
        applySimplifiedUIMode(request.fontSize);
        sendResponse({ status: 'success' });
    }
});
