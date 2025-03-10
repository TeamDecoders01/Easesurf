import type React from 'react';
import { useState } from 'react';

const Mag: React.FC = () => {
    const [isActive, setIsActive] = useState(false);

    const toggleMagnifier = () => {
        const action = isActive ? 'disable' : 'enable';

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            'Message error:',
                            chrome.runtime.lastError.message,
                        );
                    } else {
                        console.log('Response:', response);
                        setIsActive(!isActive);
                    }
                });
            }
        });
    };

    return (
        <div className="fixed bottom-5 right-5 bg-white shadow-lg p-4 rounded-lg flex flex-col items-center gap-2 border border-gray-300">
            <h2 className="text-lg font-semibold mb-2">
                {' '}
                {/* Added margin-bottom */}
                <strong>Magnifier Control</strong>
            </h2>
            <button
                type="button"
                className={`px-4 py-2 rounded-lg text-white ${
                    isActive
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
                onClick={toggleMagnifier}
            >
                {isActive ? 'Disable Magnifier' : 'Enable Magnifier'}
            </button>
        </div>
    );
};

export default Mag;
