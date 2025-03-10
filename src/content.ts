import { startAutoScroll, stopAutoScroll } from './scripts/Scroll';

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    console.log('Content script received:', request);
    if (request.action === 'startScroll') {
        startAutoScroll();
    } else if (request.action === 'stopScroll') {
        stopAutoScroll();
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection()?.toString() || '';
        sendResponse({ text: selectedText });
    }
});
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'startChat') {
        sendResponse({ status: 'Chat started' });
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'summarizePage') {
        const pageText = document.body.innerText; 
        sendResponse({ text: pageText });
    }
});
