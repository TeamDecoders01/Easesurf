import { startAutoScroll, stopAutoScroll } from './scripts/AutoScroll';

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    console.log('Content script received:', request);
    if (request.action === 'startScroll') {
        startAutoScroll();
    } else if (request.action === 'stopScroll') {
        stopAutoScroll();
    }
});
// src/Content.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection()?.toString() || '';
        sendResponse({ text: selectedText });
    }
});
