import { useState, type ChangeEvent, type ReactNode } from 'react';

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
                { action: 'updateFontSize', fontSize: newSize },
                console.log,
            );
        });
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Simplified UI Controller</h1>
            <label htmlFor="size">
                Size:
                <input
                    type="number"
                    name="size"
                    value={size}
                    onChange={handleInput}
                    style={{ marginLeft: '0.5rem', width: '80px' }}
                />
            </label>
        </div>
    );
}
