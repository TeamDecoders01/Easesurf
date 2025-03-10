import { useState } from "react";
import { summarizeText } from "../scripts/summarise";

const Summarize: React.FC = () => {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSummarize = () => {
        setLoading(true);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: () => document.body.innerText, // Extract text from page
                    },
                    async (results) => {
                        const pageText = results?.[0]?.result || "";
                        if (pageText) {
                            const summaryResponse = await summarizeText(
                                pageText
                            );
                            setSummary(summaryResponse);
                        } else {
                            setSummary("No text found to summarize.");
                        }
                        setLoading(false);
                    }
                );
            }
        });
    };

    return (
        <div className="p-4 w-80 border rounded-lg shadow-lg bg-white">
            <h1 className="text-lg font-bold mb-4">AI Summarizer</h1>
            <button
                type="button"
                onClick={handleSummarize}
                className="bg-blue-500 text-white p-2 rounded w-full"
                disabled={loading}
            >
                {loading ? "Summarizing..." : "Summarize Page"}
            </button>
            {summary && (
                <p className="mt-4 p-2 border bg-gray-100">{summary}</p>
            )}
        </div>
    );
};

export default Summarize;
