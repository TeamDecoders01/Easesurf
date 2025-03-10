// src/scripts/contrastMode.ts

/**
 * Toggles high contrast mode for better visibility
 * Designed for elderly users with low vision
 */
export function toggleHighContrast(isEnabled: boolean): void {
    // Remove night mode if it's active and we're enabling high contrast
    if (isEnabled && document.body.classList.contains('night-mode')) {
        document.body.classList.remove('night-mode');
    }

    // Apply high contrast styles
    if (isEnabled) {
        // Add a style element if it doesn't exist
        if (!document.getElementById('high-contrast-styles')) {
            const style = document.createElement('style');
            style.id = 'high-contrast-styles';
            style.textContent = `
                body {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                }
                p, h1, h2, h3, h4, h5, h6, span, div, li, td, th {
                    color: #ffffff !important;
                    text-shadow: none !important;
                }
                a {
                    color: #ffff00 !important;
                    text-decoration: underline !important;
                }
                button, input, select, textarea {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    border: 2px solid #ffffff !important;
                }
                img, video {
                    filter: brightness(1.2) contrast(1.5);
                }
                * {
                    box-shadow: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Remove high contrast styles
        const styleElement = document.getElementById('high-contrast-styles');
        if (styleElement?.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    }

    // Save the state
    chrome.storage.sync.set({ highContrastEnabled: isEnabled });
    console.log(`High Contrast Mode ${isEnabled ? 'Enabled' : 'Disabled'}`);
}

/**
 * Toggles night mode with warmer colors to reduce eye strain
 */
export function toggleNightMode(isEnabled: boolean): void {
    // Remove high contrast if it's active and we're enabling night mode
    if (isEnabled && document.body.classList.contains('high-contrast')) {
        document.body.classList.remove('high-contrast');
    }

    // Apply night mode styles
    if (isEnabled) {
        // Add a style element if it doesn't exist
        if (!document.getElementById('night-mode-styles')) {
            const style = document.createElement('style');
            style.id = 'night-mode-styles';
            style.textContent = `
                body {
                    background-color: #232323 !important;
                    color: #e0e0e0 !important;
                }
                p, h1, h2, h3, h4, h5, h6, span, div, li, td, th {
                    color: #e0e0e0 !important;
                }
                a {
                    color: #aaccff !important;
                }
                button, input, select, textarea {
                    background-color: #333333 !important;
                    color: #dddddd !important;
                    border: 1px solid #555555 !important;
                }
                img, video {
                    filter: brightness(0.85) sepia(0.2);
                }
                html {
                    filter: sepia(0.15) brightness(0.95);
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Remove night mode styles
        const styleElement = document.getElementById('night-mode-styles');
        if (styleElement?.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    }

    // Save the state
    chrome.storage.sync.set({ nightModeEnabled: isEnabled });
    console.log(`Night Mode ${isEnabled ? 'Enabled' : 'Disabled'}`);
}

/**
 * Initialize accessibility modes from saved settings
 */
export function initAccessibilityModes(): void {
    chrome.storage.sync.get(
        ['highContrastEnabled', 'nightModeEnabled'],
        (result) => {
            if (result.highContrastEnabled) {
                document.body.classList.add('high-contrast');
                toggleHighContrast(true);
            } else if (result.nightModeEnabled) {
                document.body.classList.add('night-mode');
                toggleNightMode(true);
            }
        },
    );
}
