import type React from "react";
import { useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const Scroll: React.FC = () => {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleStart = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "startScroll" });
                setIsScrolling(true);
            }
        });
    };

    const handleStop = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "stopScroll" });
                setIsScrolling(false);
            }
        });
    };

    return (
        <div className="p-4 w-80 border-2 border-gray-300 rounded-lg shadow-md bg-white">
            <h2 className="text-2xl font-bold text-white-700 mb-4">
                <strong>Smart Auto-Scroll</strong>
            </h2>
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={isScrolling}
                        className="bg-green-500 text-white px-6 py-2 w-38 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FaPlay /> Start
                    </button>
                    <button
                        type="button"
                        onClick={handleStop}
                        disabled={!isScrolling}
                        className="bg-red-500 text-white px-6 py-2 w-38 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FaPause /> Stop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Scroll;
