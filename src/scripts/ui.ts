function hideElements(selectors: string[]): void {
    for (const selector of selectors) {
        for (const el of document.querySelectorAll<HTMLElement>(selector)) {
            el.style.display = 'none';
        }
    }
}

function updateTextStyles(size: number): void {
    const textElements = document.querySelectorAll<HTMLElement>(
        'body, p, h1, h2, h3, h4, h5, h6, span, a',
    );
    for (const el of textElements) {
        el.style.fontSize = `${size}px`;
    }
}

export function applySimplifiedUIMode(size: number): void {
    const selectorsToHide = ['.ad', '.advertisement', '.sidebar', '.popup'];

    hideElements(selectorsToHide);
    updateTextStyles(size);
}
