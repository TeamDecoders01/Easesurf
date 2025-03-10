// content.ts
import { PageMagnifier } from './scripts/Magnify';

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
});
