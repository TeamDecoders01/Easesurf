// Store whether the blue overlay is currently active
let isBlueOverlayActive = false;

console.log('Background script loaded!');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.type === 'toggleBlueScreen') {
        isBlueOverlayActive = !isBlueOverlayActive;

        // Store the state in Chrome storage for persistence
        chrome.storage.local.set({ isBlueOverlayActive });

        // Apply to all current tabs
        applyBlueOverlayToAllTabs();

        sendResponse({ success: true, isActive: isBlueOverlayActive });
        return true;
    }

    if (message.type === 'getBlueScreenState') {
        sendResponse({ isActive: isBlueOverlayActive });
        return true;
    }
});

// When the extension starts, restore the saved state
chrome.storage.local.get('isBlueOverlayActive', (result) => {
    isBlueOverlayActive = result.isBlueOverlayActive || false;
    console.log('Restored blue screen state:', isBlueOverlayActive);

    // Apply the state to all tabs on startup
    if (isBlueOverlayActive) {
        applyToAllTabs();
    }
});

// Apply to all tabs when requested
function applyBlueOverlayToAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        console.log(
            `Applying blue screen filter to ${tabs.length} tabs. State:`,
            isBlueOverlayActive,
        );

        for (const tab of tabs) {
            if (tab.id) {
                try {
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            type: 'updateBlueScreen',
                            isActive: isBlueOverlayActive,
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(
                                    `Could not update tab ${tab.id}: ${chrome.runtime.lastError.message}`,
                                );
                            } else if (response) {
                                console.log(
                                    `Tab ${tab.id} updated successfully:`,
                                    response,
                                );
                            }
                        },
                    );
                } catch (error) {
                    console.error(
                        `Error sending message to tab ${tab.id}:`,
                        error,
                    );
                }
            }
        }
    });
}

// When a new tab is loaded, apply the current filter state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
    if (changeInfo.status === 'complete') {
        console.log(
            `Tab ${tabId} updated. Current blue screen state:`,
            isBlueOverlayActive,
        );

        if (isBlueOverlayActive) {
            chrome.tabs.sendMessage(
                tabId,
                {
                    type: 'updateBlueScreen',
                    isActive: true,
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.log(
                            `Could not update new tab ${tabId}: ${chrome.runtime.lastError.message}`,
                        );
                    } else if (response) {
                        console.log(
                            `New tab ${tabId} updated successfully:`,
                            response,
                        );
                    }
                },
            );
        }
    }
});

// Import reminder content
const waterReminder = 'Time to drink water!';
const stretchReminder = 'Time to stretch and move!';

// Variables to store interval IDs
let waterIntervalId: string | number | NodeJS.Timeout | undefined;
let stretchIntervalId: string | number | NodeJS.Timeout | undefined;

// Storage key for persistence
const STORAGE_KEY = 'health-reminder-active-state';

// Function to start reminders
function startReminders() {
    // Water reminder
    waterIntervalId = setInterval(() => {
        showNotification(waterReminder);
    }, 10000); // every 10 seconds for demo, adjust as needed

    // Stretch reminder
    stretchIntervalId = setInterval(() => {
        showNotification(stretchReminder);
    }, 15000); // every 15 seconds for demo, adjust as needed
}

// Function to stop reminders
function stopReminders() {
    if (waterIntervalId) {
        clearInterval(waterIntervalId);
        waterIntervalId = undefined;
    }

    if (stretchIntervalId) {
        clearInterval(stretchIntervalId);
        stretchIntervalId = undefined;
    }
}

// Function to show notification
function showNotification(message: string) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Health Reminder',
        message: message,
        priority: 2,
    });
}

// Initialize reminder state from storage when the background script loads
chrome.storage.local.get([STORAGE_KEY], (result) => {
    const isActive = result[STORAGE_KEY] === true;

    if (isActive) {
        startReminders();
    }
});

// Listen for messages from the extension's popup or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // Handle toggle message
    if (message.type === 'TOGGLE_REMINDERS') {
        const isActive = message.payload.isActive;

        // Update storage
        chrome.storage.local.set({ [STORAGE_KEY]: isActive });

        // Start or stop reminders
        if (isActive) {
            startReminders();
            sendResponse({ success: true, status: 'started' });
        } else {
            stopReminders();
            sendResponse({ success: true, status: 'stopped' });
        }
    }

    // Handle get status message
    if (message.type === 'GET_REMINDER_STATUS') {
        const isActive = !!waterIntervalId; // Check if intervals are active
        sendResponse({ isActive: isActive });
    }

    // Return true to indicate you wish to send a response asynchronously
    return true;
});

// background.ts for Color Blindness extension

// Define the different types of color blindness
enum ColorBlindnessType {
    NORMAL = 'normal',
    PROTANOPIA = 'protanopia',
    DEUTERANOPIA = 'deuteranopia',
    TRITANOPIA = 'tritanopia',
    ACHROMATOPSIA = 'achromatopsia',
}

// Store the current active filter
let activeColorFilter: ColorBlindnessType = ColorBlindnessType.NORMAL;

console.log('Color Blindness Simulator background script loaded!');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.type === 'applyColorFilter') {
        const { filterType } = message;

        // If toggling the same filter, set to normal
        if (
            filterType === activeColorFilter &&
            filterType !== ColorBlindnessType.NORMAL
        ) {
            activeColorFilter = ColorBlindnessType.NORMAL;
        } else {
            activeColorFilter = filterType;
        }

        // Store the state in Chrome storage for persistence
        chrome.storage.local.set({ activeColorFilter });

        // Apply to all current tabs
        applyToAllTabs();

        sendResponse({ success: true, activeFilter: activeColorFilter });
        return true;
    }

    if (message.type === 'getColorFilterState') {
        sendResponse({ activeFilter: activeColorFilter });
        return true;
    }
});

// When the extension starts, restore the saved state
chrome.storage.local.get('activeColorFilter', (result) => {
    activeColorFilter = result.activeColorFilter || ColorBlindnessType.NORMAL;
    console.log('Restored color filter state:', activeColorFilter);

    // Apply the state to all tabs on startup
    if (activeColorFilter !== ColorBlindnessType.NORMAL) {
        applyToAllTabs();
    }
});

// Apply to all tabs when requested
function applyToAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        console.log(
            `Applying color filter to ${tabs.length} tabs. Filter:`,
            activeColorFilter,
        );

        for (const tab of tabs) {
            if (tab.id) {
                try {
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            type: 'updateColorFilter',
                            filterType: activeColorFilter,
                        },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(
                                    `Could not update tab ${tab.id}: ${chrome.runtime.lastError.message}`,
                                );
                            } else if (response) {
                                console.log(
                                    `Tab ${tab.id} updated successfully:`,
                                    response,
                                );
                            }
                        },
                    );
                } catch (error) {
                    console.error(
                        `Error sending message to tab ${tab.id}:`,
                        error,
                    );
                }
            }
        }
    });
}

// When a new tab is loaded, apply the current filter state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
    if (changeInfo.status === 'complete') {
        console.log(
            `Tab ${tabId} updated. Current color filter:`,
            activeColorFilter,
        );

        if (activeColorFilter !== ColorBlindnessType.NORMAL) {
            chrome.tabs.sendMessage(
                tabId,
                {
                    type: 'updateColorFilter',
                    filterType: activeColorFilter,
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.log(
                            `Could not update new tab ${tabId}: ${chrome.runtime.lastError.message}`,
                        );
                    } else if (response) {
                        console.log(
                            `New tab ${tabId} updated successfully:`,
                            response,
                        );
                    }
                },
            );
        }
    }
});

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log({ changeInfo });
    if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                // Scan the DOM for elements missing any aria-* attributes.
                const elements = document.body.querySelectorAll('*');
                const totalElements = elements.length;
                const missingAria = [];

                for (const element of elements) {
                    const hasAria = Array.from(element.attributes).some(
                        (attr) => attr.name.startsWith('aria-'),
                    );
                    if (!hasAria) {
                        missingAria.push(element);
                    }
                }

                const missingCount = missingAria.length;
                const ariaScore = 100 * (1 - missingCount / totalElements);

                console.log(
                    `Accessibility Score based on aria attributes: ${ariaScore.toFixed(2)}`,
                );
                console.log(`Total Elements: ${totalElements}`);
                console.log(`Missing Aria-* Attributes: ${missingCount}`);

                // Visual accessibility scoring logic
                const IDEAL_FONT_SIZE_MIN = 12; // in pixels
                const IDEAL_FONT_SIZE_MAX = 24; // in pixels
                const BASE_SCORE = 100;

                // Get the current font size from the root element.
                const computedFontSize = Number.parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                );
                let visualScore = BASE_SCORE;

                // Penalize score based on font-size deviation.
                if (computedFontSize < IDEAL_FONT_SIZE_MIN) {
                    visualScore -= (IDEAL_FONT_SIZE_MIN - computedFontSize) * 2;
                } else if (computedFontSize > IDEAL_FONT_SIZE_MAX) {
                    visualScore -= (computedFontSize - IDEAL_FONT_SIZE_MAX) * 2;
                }

                // Check if High Contrast Mode is active using the 'forced-colors' media query.
                const highContrast = window.matchMedia(
                    '(forced-colors: active)',
                ).matches;
                if (!highContrast) {
                    visualScore -= 10; // Deduct points if not in high contrast mode.
                }

                // Clamp the visual score between 0 and 100.
                visualScore = Math.max(0, Math.min(visualScore, 100));

                console.log(
                    `Visual Accessibility Score: ${visualScore.toFixed(2)}`,
                );

                // Combine the two scores; adjust weighting as needed.
                const finalScore = (ariaScore + visualScore) / 2;
                console.log(
                    `Final Accessibility Score: ${finalScore.toFixed(2)}`,
                );

                // Set the final score as a custom aria attribute on the document's root element.
                document.documentElement.setAttribute(
                    'aria-a11y-score',
                    finalScore.toFixed(2),
                );
            },
        });
    }
});
