import type React from 'react';
import { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { getAIResponse } from '../scripts/geminiChat';

const generateUniqueId = () => `message-${Date.now()}-${Math.random()}`;

const ChatUI: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<
        { id: string; type: 'user' | 'ai'; text: string }[]
    >([]);

    const handleSendMessage = async () => {
        const query = input.trim();
        if (!query) return;

        const userMessage = {
            id: generateUniqueId(),
            type: 'user' as const,
            text: query,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        const aiResponse = await getAIResponse(query);
        const aiMessage = {
            id: generateUniqueId(),
            type: 'ai' as const,
            text: aiResponse,
        };
        setMessages((prev) => [...prev, aiMessage]);
    };

    return (
        <div className="p-4 w-80 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold mb-4">
                <strong>AI Chat Assistant</strong>
            </h2>
            <div className="h-40 overflow-y-auto border p-2 mb-2 bg-gray-100">
                {messages.map((msg) => (
                    <p
                        key={msg.id}
                        className={
                            msg.type === 'user'
                                ? 'text-right text-blue-600'
                                : 'text-left text-gray-700'
                        }
                    >
                        <strong>{msg.type === 'user' ? 'You' : 'AI'}:</strong>{' '}
                        {msg.text}
                    </p>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    className="flex-1 p-3 border rounded"
                />
                <button
                    type="button"
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white p-3 rounded"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default ChatUI;
