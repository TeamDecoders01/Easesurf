const API_KEY = ''; //import.meta.env.VITE_GEMINI_API_KEY;
const API_URL =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function getAIResponse(query: string): Promise<string> {
    if (!API_KEY) {
        console.error('API Key is missing!');
        return 'API key is not set!';
    }

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: query }] }],
                generationConfig: {
                    temperature: 0.7,
                },
            }),
        });

        if (!response.ok) {
            console.error(
                'API response error:',
                response.status,
                response.statusText,
            );
            return 'Error: Failed to get response from AI.';
        }

        const data = await response.json();
        console.log('API Response:', data);

        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't understand."
        );
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return 'There was an error processing your request.';
    }
}
