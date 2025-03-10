import { PageMagnifier } from './scripts/Magnify';
import { startAutoScroll, stopAutoScroll } from './scripts/Scroll';
import { applySimplifiedUIMode } from './scripts/ui';
// Import the new contrast mode functions
import {
    toggleHighContrast,
    toggleNightMode,
    initAccessibilityModes,
} from './scripts/Contrast';

import {
    type AutoClickHelper,
    initAutoClick,
    toggleAutoClick,
} from './scripts/AutoClicks';

// Create a global instance of PageMagnifier
const pageMagnifier = new PageMagnifier(200, 2);
let autoClickHelper: AutoClickHelper = initAutoClick();

// Initialize settings from storage
chrome.storage.sync.get(['autoClickEnabled', 'autoClickDelay'], (result) => {
    if (result.autoClickEnabled) {
        autoClickHelper = initAutoClick(
            true,
            result.autoClickDelay * 1000 || 3000,
        );
    }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // Your existing magnifier message handling
    if (message.action === 'enable') {
        pageMagnifier.start().then(() => {
            sendResponse({ status: 'Magnifier enabled' });
        });
    } else if (message.action === 'disable') {
        pageMagnifier.stop();
        sendResponse({ status: 'Magnifier disabled' });
    }
    // Contrast mode message handlers
    else if (message.action === 'toggleHighContrast') {
        const isEnabled = document.body.classList.toggle('high-contrast');
        toggleHighContrast(isEnabled);
        sendResponse({ status: 'High Contrast Toggled' });
    } else if (message.action === 'toggleNightMode') {
        const isEnabled = document.body.classList.toggle('night-mode');
        toggleNightMode(isEnabled);
        sendResponse({ status: 'Night Mode Toggled' });
    }
    // New auto-click message handlers
    else if (message.action === 'toggleAutoClick') {
        const isEnabled = toggleAutoClick(message.state, autoClickHelper);
        chrome.storage.sync.set({ autoClickEnabled: isEnabled });
        sendResponse({
            status: `Auto-Click ${isEnabled ? 'Enabled' : 'Disabled'}`,
        });
    } else if (message.action === 'updateAutoClickDelay') {
        // Recreate the helper with new delay
        autoClickHelper.stop();
        autoClickHelper = initAutoClick(true, message.delay);
        sendResponse({ status: 'Auto-Click Delay Updated' });
    }

    // Return true to indicate we'll respond asynchronously
    return true;
}

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
    if (request.action === 'startChat') {
        sendResponse({ status: 'Chat started' });
    }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'summarizePage') {
        const pageText = document.body.innerText; 
        sendResponse({ text: pageText });

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'updateFontSize' && request.fontSize) {
        applySimplifiedUIMode(request.fontSize);
        sendResponse({ status: 'success' });
    }
});

function createFloatingButton(): void {
    if (document.getElementById('my-floating-button')) return;

    const btn = document.createElement('button');
    btn.id = 'my-floating-button';
    btn.textContent = 'Open Extension';

    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        padding: '12px 16px',
        borderRadius: '50px',
        backgroundColor: '#6200EE',
        color: '#fff',
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        fontSize: '14px',
    });

    btn.addEventListener('click', () => {
        chrome.runtime.sendMessage(
            { type: 'OPEN_EXTENSION_UI' },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error(
                        'Message error:',
                        chrome.runtime.lastError.message,
                    );
                } else {
                    console.log('Extension UI opened:', response);
                }
            },
        );
    });

    document.body.appendChild(btn);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
} else {
    createFloatingButton();
}
