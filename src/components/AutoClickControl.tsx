import { useState, useEffect } from "react";

const AutoClickControl: React.FC = () => {
    const [isAutoClickActive, setIsAutoClickActive] = useState(false);
    const [hoverDelay, setHoverDelay] = useState(3);

    useEffect(() => {
        chrome.storage.sync.get(
            ["autoClickEnabled", "autoClickDelay"],
            (result) => {
                setIsAutoClickActive(result.autoClickEnabled || false);
                setHoverDelay(result.autoClickDelay || 3);
            }
        );
    }, []);

    const toggleAutoClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "toggleAutoClick",
                        state: !isAutoClickActive,
                        delay: hoverDelay * 1000,
                    },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                "Message error:",
                                chrome.runtime.lastError.message
                            );
                        } else {
                            console.log("Response:", response);
                            const newState = !isAutoClickActive;
                            setIsAutoClickActive(newState);

                            chrome.storage.sync.set({
                                autoClickEnabled: newState,
                                autoClickDelay: hoverDelay,
                            });
                        }
                    }
                );
            }
        });
    };

    const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDelay = Number.parseInt(e.target.value, 10);
        setHoverDelay(newDelay);

        chrome.storage.sync.set({
            autoClickDelay: newDelay,
        });

        if (isAutoClickActive) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "updateAutoClickDelay",
                        delay: newDelay * 1000,
                    });
                }
            });
        }
    };

    return (
        <div className="bg-white shadow-lg p-4 rounded-lg border border-gray-300 mb-4">
            <h2 className="text-lg font-semibold mb-3">
                <strong>Auto-Click Assistant</strong>
            </h2>

            <div className="flex flex-col gap-3">
                <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-between ${
                        isAutoClickActive ? "bg-green-600" : "bg-gray-500"
                    }`}
                    onClick={toggleAutoClick}
                >
                    <span className="ml-2 text-xs bg-white text-gray-800 px-2 py-1 rounded-full">
                        Auto-Click
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoClickControl;
