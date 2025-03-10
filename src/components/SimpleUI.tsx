import { useState, type ChangeEvent, type ReactNode } from "react";

export default function SimpleUI(): ReactNode {
    const [size, setSize] = useState(18);

    const handleInput = ({
        target: { valueAsNumber: newSize },
    }: ChangeEvent<HTMLInputElement>) => {
        if (Number.isNaN(newSize)) return;

        setSize(newSize);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0]?.id;
            if (!tab) return;

            chrome.tabs.sendMessage(
                tab,
                { action: "updateFontSize", fontSize: newSize },
                console.log
            );
        });
    };

    return (
        <div className="p-4 w-full flex justify-center items-center">
            <div className="border-2 border-gray-300 rounded-lg p-4 shadow-md w-80 bg-white">
                <div className="flex items-center justify-between">
                    <h2 className="text-gray-600 text-3xl font-bold">
                        <strong>Simplified UI Controller</strong>
                    </h2>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={10}
                            max={40}
                            value={size}
                            onChange={handleInput}
                            className="w-24 cursor-pointer accent-blue-500"
                        />
                        <span className="text-gray-700 font-medium w-10 text-center">
                            {size}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
