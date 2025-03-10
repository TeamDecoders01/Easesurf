import { toggleHighContrast, toggleNightMode } from './scripts/Contrast';
import { PageMagnifier } from './scripts/Magnify';
import { startAutoScroll, stopAutoScroll } from './scripts/Scroll';
import { applySimplifiedUIMode } from './scripts/ui';
import {
    type AutoClickHelper,
    initAutoClick,
    toggleAutoClick,
} from './scripts/AutoClicks';

console.log('Content script loaded on:', window.location.href);

// Function to toggle the blue screen filter
function toggleBlueScreenFilter(forceState?: boolean): boolean {
    const OVERLAY_ID = 'blue-screen-filter-overlay';
    const existingOverlay = document.getElementById(OVERLAY_ID);

    console.log(
        'Toggling blue filter. Force state:',
        forceState,
        'Existing overlay:',
        !!existingOverlay,
    );

    // If forceState is defined, use it; otherwise toggle based on existing element
    const shouldAdd = forceState !== undefined ? forceState : !existingOverlay;

    // Remove existing overlay if it exists
    if (existingOverlay) {
        existingOverlay.remove();
        console.log('Removed existing overlay');
    }

    // Add new overlay if needed
    if (shouldAdd) {
        // Make sure the body exists before appending
        if (document.body) {
            // Create overlay div instead of using ::after pseudo-element
            const overlay = document.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(255, 191, 0, 0.15)';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '9999';

            document.body.appendChild(overlay);
            console.log('Added new overlay');

            return true;
        }
        console.error('Document body not found, cannot add overlay');
        return false;
    }

    // Return current state
    const currentState = !!document.getElementById(OVERLAY_ID);
    console.log('Filter current state:', currentState);
    return currentState;
}

// Ensure body is ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}

function initializeContentScript() {
    // Listen for scroll messages and other commands
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        console.log('Content script received:', request);

        try {
            if (request.action === 'startScroll') {
                startAutoScroll();
                sendResponse({ success: true });
            } else if (request.action === 'stopScroll') {
                stopAutoScroll();
                sendResponse({ success: true });
            } else if (request.action === 'getSelectedText') {
                const selectedText = window.getSelection()?.toString() || '';
                sendResponse({ text: selectedText });
            } else if (request.type === 'updateBlueScreen') {
                const isActive = toggleBlueScreenFilter(request.isActive);
                sendResponse({ success: true, isActive });
            } else if (request.type === 'getBlueScreenState') {
                const isBlueOverlayActive = !!document.getElementById(
                    'blue-screen-filter-overlay',
                );
                sendResponse({ isActive: isBlueOverlayActive });
            } else {
                console.log('Unknown message type:', request);
                sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }

        // Return true to indicate you wish to send a response asynchronously
        return true;
    });

    // Initialize the filter state when the content script loads
    chrome.runtime.sendMessage({ type: 'getBlueScreenState' }, (response) => {
        console.log('Initial blue screen state:', response);
        if (response?.isActive) {
            toggleBlueScreenFilter(true);
        }
    });
}


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

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('Content script received:', request);
    if (request.action === 'startScroll') {
        startAutoScroll();
    } else if (request.action === 'stopScroll') {
        stopAutoScroll();
    }
    sendResponse({ status: 'Scroll action handled' });
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
    }
});

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
