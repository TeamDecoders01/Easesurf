import { useState } from "react";
import { translateText } from "../scripts/translate";

const LanguageConverter: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("es");
    const [status, setStatus] = useState("");

    const handleTranslate = async () => {
        setStatus("Translating...");

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: () => document.body.innerText,
                    },
                    async (results) => {
                        const pageText = results?.[0]?.result || "";
                        if (!pageText.trim()) {
                            setStatus("No text found to translate.");
                            return;
                        }

                        const translatedText = await translateText(
                            pageText,
                            selectedLanguage
                        );
                        if (tabs[0].id !== undefined) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: "replaceText",
                                text: translatedText,
                            });
                        }
                        setStatus("Translation Complete!");
                    }
                );
            }
        });
    };

    return (
        <div className="p-4 w-80 border rounded-lg shadow-lg bg-white">
            <h2 className="text-lg font-bold mb-4">
                Native Language Converter
            </h2>

            <label
                htmlFor="language-select"
                className="block mb-2 text-sm font-medium text-gray-700"
            >
                Select Language:
            </label>
            <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
                <option value="zh">Chinese</option>
            </select>

            <button
                type="button"
                onClick={handleTranslate}
                className="w-full bg-blue-500 text-white p-2 rounded"
            >
                Translate Page
            </button>

            {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
        </div>
    );
};

export default LanguageConverter;
