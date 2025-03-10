import { useState, useEffect } from 'react';

const ContrastMode: React.FC = () => {
    const [isHighContrastActive, setIsHighContrastActive] = useState(false);
    const [isNightModeActive, setIsNightModeActive] = useState(false);

    // Load initial state from Chrome storage
    useEffect(() => {
        chrome.storage.sync.get(
            ['highContrastEnabled', 'nightModeEnabled'],
            (result) => {
                setIsHighContrastActive(result.highContrastEnabled || false);
                setIsNightModeActive(result.nightModeEnabled || false);
            },
        );
    }, []);

    const toggleHighContrast = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'toggleHighContrast' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                'Message error:',
                                chrome.runtime.lastError.message,
                            );
                        } else {
                            console.log('Response:', response);
                            const newState = !isHighContrastActive;
                            setIsHighContrastActive(newState);

                            // If enabling high contrast, disable night mode
                            if (newState && isNightModeActive) {
                                setIsNightModeActive(false);
                            }
                        }
                    },
                );
            }
        });
    };

    const toggleNightMode = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'toggleNightMode' },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                'Message error:',
                                chrome.runtime.lastError.message,
                            );
                        } else {
                            console.log('Response:', response);
                            const newState = !isNightModeActive;
                            setIsNightModeActive(newState);

                            // If enabling night mode, disable high contrast
                            if (newState && isHighContrastActive) {
                                setIsHighContrastActive(false);
                            }
                        }
                    },
                );
            }
        });
    };

    return (
        <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-300 mb-4">
            <h2 className="text-lg font-semibold mb-3">Display Settings</h2>

            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-between ${
                        isHighContrastActive ? 'bg-blue-600' : 'bg-gray-500'
                    }`}
                    onClick={toggleHighContrast}
                >
                    <span>High Contrast Mode</span>
                    <span className="ml-2 text-xs bg-white text-gray-800 px-2 py-1 rounded-full">
                        Better Visibility
                    </span>
                </button>

                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-between ${
                        isNightModeActive ? 'bg-amber-600' : 'bg-gray-500'
                    }`}
                    onClick={toggleNightMode}
                >
                    <span>Night Mode</span>
                    <span className="ml-2 text-xs bg-white text-gray-800 px-2 py-1 rounded-full">
                        Reduces Eye Strain
                    </span>
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
                High contrast helps elderly users with low vision see text
                clearly.
            </p>
        </div>
    );
};

export default ContrastMode;
