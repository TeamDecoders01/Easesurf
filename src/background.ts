let isBlueOverlayActive = false;

console.log('Background script loaded!');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.type === 'toggleBlueScreen') {
        isBlueOverlayActive = !isBlueOverlayActive;

        chrome.storage.local.set({ isBlueOverlayActive });

        applyBlueOverlayToAllTabs();

        sendResponse({ success: true, isActive: isBlueOverlayActive });
        return true;
    }

    if (message.type === 'getBlueScreenState') {
        sendResponse({ isActive: isBlueOverlayActive });
        return true;
    }
});

chrome.storage.local.get('isBlueOverlayActive', (result) => {
    isBlueOverlayActive = result.isBlueOverlayActive || false;
    console.log('Restored blue screen state:', isBlueOverlayActive);

    if (isBlueOverlayActive) {
        applyToAllTabs();
    }
});

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

const waterReminder = 'Time to drink water!';
const stretchReminder = 'Time to stretch and move!';

let waterIntervalId: string | number | NodeJS.Timeout | undefined;
let stretchIntervalId: string | number | NodeJS.Timeout | undefined;

const STORAGE_KEY = 'health-reminder-active-state';

function startReminders() {
    waterIntervalId = setInterval(() => {
        showNotification(waterReminder);
    }, 10000);

    stretchIntervalId = setInterval(() => {
        showNotification(stretchReminder);
    }, 15000);
}

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

function showNotification(message: string) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Health Reminder',
        message: message,
        priority: 2,
    });
}

chrome.storage.local.get([STORAGE_KEY], (result) => {
    const isActive = result[STORAGE_KEY] === true;

    if (isActive) {
        startReminders();
    }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'TOGGLE_REMINDERS') {
        const isActive = message.payload.isActive;

        chrome.storage.local.set({ [STORAGE_KEY]: isActive });

        if (isActive) {
            startReminders();
            sendResponse({ success: true, status: 'started' });
        } else {
            stopReminders();
            sendResponse({ success: true, status: 'stopped' });
        }
    }

    if (message.type === 'GET_REMINDER_STATUS') {
        const isActive = !!waterIntervalId;
        sendResponse({ isActive: isActive });
    }

    return true;
});

enum ColorBlindnessType {
    NORMAL = 'normal',
    PROTANOPIA = 'protanopia',
    DEUTERANOPIA = 'deuteranopia',
    TRITANOPIA = 'tritanopia',
    ACHROMATOPSIA = 'achromatopsia',
}

let activeColorFilter: ColorBlindnessType = ColorBlindnessType.NORMAL;

console.log('Color Blindness Simulator background script loaded!');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);

    if (message.type === 'applyColorFilter') {
        const { filterType } = message;

        if (
            filterType === activeColorFilter &&
            filterType !== ColorBlindnessType.NORMAL
        ) {
            activeColorFilter = ColorBlindnessType.NORMAL;
        } else {
            activeColorFilter = filterType;
        }

        chrome.storage.local.set({ activeColorFilter });

        applyToAllTabs();

        sendResponse({ success: true, activeFilter: activeColorFilter });
        return true;
    }

    if (message.type === 'getColorFilterState') {
        sendResponse({ activeFilter: activeColorFilter });
        return true;
    }
});

chrome.storage.local.get('activeColorFilter', (result) => {
    activeColorFilter = result.activeColorFilter || ColorBlindnessType.NORMAL;
    console.log('Restored color filter state:', activeColorFilter);

    if (activeColorFilter !== ColorBlindnessType.NORMAL) {
        applyToAllTabs();
    }
});

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log({ changeInfo });
    if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
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

                const IDEAL_FONT_SIZE_MIN = 12;
                const IDEAL_FONT_SIZE_MAX = 24;
                const BASE_SCORE = 100;

                const computedFontSize = Number.parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                );
                let visualScore = BASE_SCORE;

                if (computedFontSize < IDEAL_FONT_SIZE_MIN) {
                    visualScore -= (IDEAL_FONT_SIZE_MIN - computedFontSize) * 2;
                } else if (computedFontSize > IDEAL_FONT_SIZE_MAX) {
                    visualScore -= (computedFontSize - IDEAL_FONT_SIZE_MAX) * 2;
                }

                const highContrast = window.matchMedia(
                    '(forced-colors: active)',
                ).matches;
                if (!highContrast) {
                    visualScore -= 10;
                }

                visualScore = Math.max(0, Math.min(visualScore, 100));

                console.log(
                    `Visual Accessibility Score: ${visualScore.toFixed(2)}`,
                );

                const finalScore = (ariaScore + visualScore) / 2;
                console.log(
                    `Final Accessibility Score: ${finalScore.toFixed(2)}`,
                );

                document.documentElement.setAttribute(
                    'aria-a11y-score',
                    finalScore.toFixed(2),
                );
            },
        });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'READ_ALOUD',
        title: 'Read aloud',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener((info, _) => {
    console.log({ info });
    if (info.menuItemId === 'READ_ALOUD') {
        const selectedText = info.selectionText;
        console.log('Selected text:', selectedText);
        if (selectedText) {
            chrome.tts.speak(selectedText, { rate: 1.0, enqueue: false });
        }
    }
});
