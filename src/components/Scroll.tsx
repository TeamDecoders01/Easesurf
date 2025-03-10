import type React from 'react';
import { useState } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

const Scroll: React.FC = () => {
    const [isScrolling, setIsScrolling] = useState(false);

    const handleStart = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'startScroll' });
                setIsScrolling(true);
            }
        });
    };

    const handleStop = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopScroll' });
                setIsScrolling(false);
            }
        });
    };

    return (
        <div className="p-4 w-64">
            <h1 className="text-lg font-bold mb-4">Smart Auto-Scroll</h1>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleStart}
                    disabled={isScrolling}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <FaPlay /> Start
                </button>
                <button
                    type="button"
                    onClick={handleStop}
                    disabled={!isScrolling}
                    className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <FaPause /> Stop
                </button>
            </div>
        </div>
    );
};

export default Scroll;
