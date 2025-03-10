import { useState } from 'react';
import { summarizeText } from '../scripts/summarise';

const Summarize: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleSummarize = () => {
        setLoading(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: () => document.body.innerText,
                    },
                    async (results) => {
                        const pageText = results?.[0]?.result || '';
                        if (pageText) {
                            const summaryResponse =
                                await summarizeText(pageText);
                            openPopUp(summaryResponse);
                        } else {
                            openPopUp('No text found to summarize.');
                        }
                        setLoading(false);
                    },
                );
            }
        });
    };

    const openPopUp = (summary: string) => {
        chrome.windows.create(
            {
                url: `data:text/html,<html><head><title>Summary</title></head><body style="background-color: black; color: white; font-size: 30px; padding: 20px;"><h1>Summary</h1><p>${summary}</p></body></html>`,
                type: 'popup',
                width: 1000,
                height: 700,
            },
            (window) => {},
        );
    };

    return (
        <div className="p-4 w-80 border rounded-lg shadow-lg bg-white">
            <h2 className="text-lg font-bold mb-4">
                <strong>AI Summarizer</strong>
            </h2>
            <button
                type="button"
                onClick={handleSummarize}
                className="bg-blue-500 text-white p-2 rounded w-full"
                disabled={loading}
            >
                {loading ? 'Summarizing...' : 'Summarize Page'}
            </button>
        </div>
    );
};

export default Summarize;
