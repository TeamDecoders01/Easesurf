export async function translateText(
    text: string,
    targetLang: string,
): Promise<string> {
    const API_URL = 'https://libretranslate.de/translate';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: text,
                source: 'auto',
                target: targetLang,
                format: 'text',
            }),
        });

        const data = await response.json();
        return data.translatedText || 'Translation failed.';
    } catch (error) {
        console.error('Error fetching translation:', error);
        return 'There was an error processing your request.';
    }
}
