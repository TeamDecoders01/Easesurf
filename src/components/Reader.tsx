import type React from "react";
import { useState } from "react";
import { FaPlay, FaStop } from "react-icons/fa";
import { startReadingText, stopReadingText } from "../scripts/ScreenReader";

const Reader: React.FC = () => {
    const [isReading, setIsReading] = useState(false);
    const [text, setText] = useState("");

    const handleGetText = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "getSelectedText" },
                    (response) => {
                        if (response?.text) {
                            setText(response.text);
                        } else {
                            alert("No text selected!");
                        }
                    }
                );
            }
        });
    };

    const handleStart = () => {
        if (text.trim()) {
            startReadingText(text);
            setIsReading(true);
        }
    };

    const handleStop = () => {
        stopReadingText();
        setIsReading(false);
    };

    return (
        <div className="p-4 w-64">
            <h2 className="text-lg font-bold mb-4">Text-to-Speech</h2>
            <button
                type="button"
                onClick={handleGetText}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-2 w-full"
            >
                Get Selected Text
            </button>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={handleStart}
                    disabled={isReading}
                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <FaPlay /> Read
                </button>
                <button
                    type="button"
                    onClick={handleStop}
                    disabled={!isReading}
                    className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <FaStop /> Stop
                </button>
            </div>
        </div>
    );
};

export default Reader;
