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
