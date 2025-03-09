import { type ReactNode, useState } from 'react';

export default function App(): ReactNode {
    const [size, setSize] = useState<number>(18);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(newSize)) {
            setSize(newSize);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { type: 'UPDATE_FONT_SIZE', fontSize: newSize },
                        (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(
                                    'Message error:',
                                    chrome.runtime.lastError.message,
                                );
                            } else {
                                console.log('Response:', response);
                            }
                        },
                    );
                }
            });
        }
    };

    return (
        <div>
            <div style={{ padding: '1rem' }}>
                <h1>Simplified UI Mode Controller</h1>
                <label>
                    Enter Font Size (px):{' '}
                    <input
                        type="number"
                        value={size}
                        onChange={handleInputChange}
                        style={{ marginLeft: '0.5rem', width: '80px' }}
                    />
                </label>
            </div>
        </div>
    );
}
