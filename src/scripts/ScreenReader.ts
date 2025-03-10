let speech: SpeechSynthesisUtterance | null = null;

export function startReadingText(text: string, rate = 1.0) {
    if (!window.speechSynthesis) {
        console.error('Text-to-Speech is not supported in this browser.');
        return;
    }

    stopReadingText();

    speech = new SpeechSynthesisUtterance(text);
    speech.rate = rate;
    speech.voice = window.speechSynthesis.getVoices()[0];

    window.speechSynthesis.speak(speech);
}

export function stopReadingText() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
}
