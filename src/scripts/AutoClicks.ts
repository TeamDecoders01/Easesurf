// scripts/AutoClick.ts

/**
 * Class to handle auto-clicking of elements after hovering for a set duration
 */
export class AutoClickHelper {
    private hoverTimer: number | null = null;
    private hoverDelay: number; // Time in ms to wait before auto-clicking
    private isEnabled = false;
    private currentElement: Element | null = null;
    private highlightClass = 'accessibility-hover-highlight';

    constructor(hoverDelay = 3000) {
        this.hoverDelay = hoverDelay;
    }

    /**
     * Start the auto-click functionality
     */
    public start(): void {
        if (this.isEnabled) return;

        this.isEnabled = true;
        this.injectStyles();
        this.addEventListeners();
    }

    /**
     * Stop the auto-click functionality
     */
    public stop(): void {
        if (!this.isEnabled) return;

        this.isEnabled = false;
        this.removeHighlight();
        this.removeEventListeners();
        this.removeStyles();
    }

    /**
     * Inject CSS styles for highlighting clickable elements
     */
    private injectStyles(): void {
        const styleElement = document.createElement('style');
        styleElement.id = 'auto-click-styles';
        styleElement.textContent = `
            .${this.highlightClass} {
                outline: 3px solid #4285f4 !important;
                box-shadow: 0 0 8px #4285f4 !important;
                transition: all 0.3s ease-in-out !important;
                position: relative !important;
            }

            .${this.highlightClass}::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background-color: #4285f4;
                animation: auto-click-progress 3s linear;
                z-index: 9999;
            }

            @keyframes auto-click-progress {
                0% { width: 0; }
                100% { width: 100%; }
            }
        `;
        document.head.appendChild(styleElement);
    }

    /**
     * Remove injected styles
     */
    private removeStyles(): void {
        const styleElement = document.getElementById('auto-click-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }

    /**
     * Add event listeners for mouse movements
     */
    private addEventListeners(): void {
        document.addEventListener('mouseover', this.handleMouseOver);
        document.addEventListener('mouseout', this.handleMouseOut);
    }

    /**
     * Remove event listeners
     */
    private removeEventListeners(): void {
        document.removeEventListener('mouseover', this.handleMouseOver);
        document.removeEventListener('mouseout', this.handleMouseOut);
        if (this.hoverTimer) {
            window.clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }
    }

    /**
     * Handle mouse over events
     */
    private handleMouseOver = (event: MouseEvent): void => {
        const target = event.target as Element;

        // Check if element is clickable (links, buttons, or elements with click handlers)
        if (this.isClickable(target)) {
            this.currentElement = target;
            this.addHighlight(target);

            // Start timer for auto-click
            this.hoverTimer = window.setTimeout(() => {
                if (this.currentElement === target) {
                    this.performClick(target);
                }
            }, this.hoverDelay);
        }
    };

    /**
     * Handle mouse out events
     */
    private handleMouseOut = (event: MouseEvent): void => {
        if (this.hoverTimer) {
            window.clearTimeout(this.hoverTimer);
            this.hoverTimer = null;
        }

        this.removeHighlight();
        this.currentElement = null;
    };

    /**
     * Check if an element is clickable
     */
    private isClickable(element: Element): boolean {
        // Check for commonly clickable elements
        const tagName = element.tagName.toLowerCase();

        // Direct clickable elements
        if (
            tagName === 'a' ||
            tagName === 'button' ||
            (tagName === 'input' &&
                ['submit', 'button', 'reset', 'checkbox', 'radio'].includes(
                    (element as HTMLInputElement).type,
                )) ||
            element.getAttribute('role') === 'button' ||
            element.hasAttribute('onclick')
        ) {
            return true;
        }

        // Check for elements with click event listeners (simplified approach)
        // This is a limited check as we can't fully detect all elements with JS click handlers
        const style = window.getComputedStyle(element);
        return style.cursor === 'pointer';
    }

    /**
     * Add highlight to element
     */
    private addHighlight(element: Element): void {
        this.removeHighlight(); // Remove any existing highlights
        element.classList.add(this.highlightClass);
    }

    /**
     * Remove highlight from current element
     */
    private removeHighlight(): void {
        if (this.currentElement) {
            this.currentElement.classList.remove(this.highlightClass);
        }
    }

    /**
     * Perform the click action on the target element
     */
    private performClick(element: Element): void {
        // Remove highlight first
        this.removeHighlight();

        try {
            // Create and dispatch a click event
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });

            element.dispatchEvent(clickEvent);

            // Provide visual feedback of the click
            this.showClickFeedback(element);
        } catch (error) {
            console.error('Auto-click failed:', error);
        }
    }

    /**
     * Show a brief visual feedback when auto-click happens
     */
    private showClickFeedback(element: Element): void {
        const feedback = document.createElement('div');
        feedback.style.position = 'absolute';
        feedback.style.zIndex = '99999';

        // Get element position
        const rect = element.getBoundingClientRect();
        feedback.style.left = `${rect.left + rect.width / 2}px`;
        feedback.style.top = `${rect.top + rect.height / 2}px`;

        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.width = '30px';
        feedback.style.height = '30px';
        feedback.style.borderRadius = '50%';
        feedback.style.backgroundColor = 'rgba(66, 133, 244, 0.5)';
        feedback.style.animation = 'click-feedback 0.5s ease-out forwards';

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes click-feedback {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(feedback);

        // Remove after animation completes
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
            style.remove();
        }, 500);
    }
}

/**
 * Initialize auto-click functionality with the given settings
 */
export function initAutoClick(enabled = false, delay = 3000): AutoClickHelper {
    const autoClickHelper = new AutoClickHelper(delay);

    if (enabled) {
        autoClickHelper.start();
    }

    return autoClickHelper;
}

/**
 * Toggle auto-click functionality
 */
export function toggleAutoClick(
    state: boolean,
    helper: AutoClickHelper,
): boolean {
    if (state) {
        helper.start();
    } else {
        helper.stop();
    }
    return state;
}
