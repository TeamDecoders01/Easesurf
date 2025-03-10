export async function summarizeText(text: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const API_URL =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    if (!API_KEY) {
        console.error('API Key is missing!');
        return 'API key is not set!';
    }

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize this: ${text}` }] }],
                generationConfig: { temperature: 0.7 },
            }),
        });

        const responseText = await response.text();

        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return `Error: ${response.status} ${response.statusText}`;
        }

        const data = JSON.parse(responseText);
        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Couldn't generate summary."
        );
    } catch (error) {
        console.error('Error fetching AI summary:', error);
        return 'There was an error processing your request.';
    }
}
