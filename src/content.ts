import { startAutoScroll, stopAutoScroll } from './scripts/AutoScroll';

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
