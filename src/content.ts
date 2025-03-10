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

function toggleBlueScreenFilter(forceState?: boolean): boolean {
    const OVERLAY_ID = 'blue-screen-filter-overlay';
    const existingOverlay = document.getElementById(OVERLAY_ID);

    console.log(
        'Toggling blue filter. Force state:',
        forceState,
        'Existing overlay:',
        !!existingOverlay,
    );

    const shouldAdd = forceState !== undefined ? forceState : !existingOverlay;

    if (existingOverlay) {
        existingOverlay.remove();
        console.log('Removed existing overlay');
    }

    if (shouldAdd) {
        if (document.body) {
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

    const currentState = !!document.getElementById(OVERLAY_ID);
    console.log('Filter current state:', currentState);
    return currentState;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}

function initializeContentScript() {
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

        return true;
    });

    chrome.runtime.sendMessage({ type: 'getBlueScreenState' }, (response) => {
        console.log('Initial blue screen state:', response);
        if (response?.isActive) {
            toggleBlueScreenFilter(true);
        }
    });
}

const pageMagnifier = new PageMagnifier(200, 2);
let autoClickHelper: AutoClickHelper = initAutoClick();

chrome.storage.sync.get(['autoClickEnabled', 'autoClickDelay'], (result) => {
    if (result.autoClickEnabled) {
        autoClickHelper = initAutoClick(
            true,
            result.autoClickDelay * 1000 || 3000,
        );
    }
});

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    if (message.action === 'enable') {
        pageMagnifier.start().then(() => {
            sendResponse({ status: 'Magnifier enabled' });
        });
    } else if (message.action === 'disable') {
        pageMagnifier.stop();
        sendResponse({ status: 'Magnifier disabled' });
    } else if (message.action === 'toggleHighContrast') {
        const isEnabled = document.body.classList.toggle('high-contrast');
        toggleHighContrast(isEnabled);
        sendResponse({ status: 'High Contrast Toggled' });
    } else if (message.action === 'toggleNightMode') {
        const isEnabled = document.body.classList.toggle('night-mode');
        toggleNightMode(isEnabled);
        sendResponse({ status: 'Night Mode Toggled' });
    } else if (message.action === 'toggleAutoClick') {
        const isEnabled = toggleAutoClick(message.state, autoClickHelper);
        chrome.storage.sync.set({ autoClickEnabled: isEnabled });
        sendResponse({
            status: `Auto-Click ${isEnabled ? 'Enabled' : 'Disabled'}`,
        });
    } else if (message.action === 'updateAutoClickDelay') {
        autoClickHelper.stop();
        autoClickHelper = initAutoClick(true, message.delay);
        sendResponse({ status: 'Auto-Click Delay Updated' });
    }

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

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'selectedText') {
        const selectedText = window.getSelection()?.toString() || '';
        if (selectedText.trim()) {
            chrome.runtime.sendMessage({
                action: 'selectedText',
                text: selectedText,
            });
        }
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

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'replaceText') {
        document.body.innerText = request.text;
        sendResponse({ status: 'Text replaced successfully!' });
    }
});
