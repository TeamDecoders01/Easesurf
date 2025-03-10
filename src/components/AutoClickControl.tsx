import { useState, useEffect } from 'react';

const AutoClickControl: React.FC = () => {
    const [isAutoClickActive, setIsAutoClickActive] = useState(false);
    const [hoverDelay, setHoverDelay] = useState(3); // in seconds

    // Load initial state from Chrome storage
    useEffect(() => {
        chrome.storage.sync.get(
            ['autoClickEnabled', 'autoClickDelay'],
            (result) => {
                setIsAutoClickActive(result.autoClickEnabled || false);
                setHoverDelay(result.autoClickDelay || 3);
            },
        );
    }, []);

    const toggleAutoClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: 'toggleAutoClick',
                        state: !isAutoClickActive,
                        delay: hoverDelay * 1000, // Convert to milliseconds
                    },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                'Message error:',
                                chrome.runtime.lastError.message,
                            );
                        } else {
                            console.log('Response:', response);
                            const newState = !isAutoClickActive;
                            setIsAutoClickActive(newState);

                            // Save state to Chrome storage
                            chrome.storage.sync.set({
                                autoClickEnabled: newState,
                                autoClickDelay: hoverDelay,
                            });
                        }
                    },
                );
            }
        });
    };

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDelay = Number.parseInt(e.target.value, 10);
        setHoverDelay(newDelay);

        // Save to storage when slider changes
        chrome.storage.sync.set({
            autoClickDelay: newDelay,
        });

        // If auto-click is active, update the current delay
        if (isAutoClickActive) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'updateAutoClickDelay',
                        delay: newDelay * 1000, // Convert to milliseconds
                    });
                }
            });
        }
    };

    return (
        <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-300 mb-4">
            <h2 className="text-lg font-semibold mb-3">Auto-Click Assistant</h2>

            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-between ${
                        isAutoClickActive ? 'bg-green-600' : 'bg-gray-500'
                    }`}
                    onClick={toggleAutoClick}
                >
                    <span>Auto-Click Mode</span>
                    <span className="ml-2 text-xs bg-white text-gray-800 px-2 py-1 rounded-full">
                        Easier Clicking
                    </span>
                </button>

                {isAutoClickActive && (
                    <div className="mt-2">
                        <label
                            htmlFor="delaySlider"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Hover Time: {hoverDelay} seconds
                        </label>
                        <input
                            id="delaySlider"
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            value={hoverDelay}
                            onChange={handleDelayChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Quick (1s)</span>
                            <span>Standard (3s)</span>
                            <span>Slow (5s)</span>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
                Hovers over links and buttons will auto-click after {hoverDelay}{' '}
                seconds, making navigation easier.
            </p>
        </div>
    );
};

export default AutoClickControl;
