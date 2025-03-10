import html2canvas from 'html2canvas';

export class PageMagnifier {
    private lens: HTMLDivElement | null = null;
    private snapshotURL: string | null = null;
    private canvasWidth = 0;
    private canvasHeight = 0;
    private captureScaleX = 1;
    private captureScaleY = 1;
    private lensDiameter: number;
    private zoomLevel: number;
    private isActive: boolean;

    public get active(): boolean {
        return this.isActive;
    }

    constructor(lensDiameter = 200, zoomLevel = 2) {
        this.lensDiameter = lensDiameter;
        this.zoomLevel = zoomLevel;
        this.isActive = false;
    }

    /**
     * Starts the magnifier with a delay to ensure the page is fully loaded.
     */
    public async start(): Promise<void> {
        if (this.isActive) return;
        this.isActive = true;

        try {
            console.log(
                'PageMagnifier: Waiting for page to stabilize before capture...',
            );

            // Delay for 500ms to allow rendering to stabilize
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Capture the page using html2canvas
            const canvas = await html2canvas(document.body, {
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight,
                scale: 1, // Disable DPI scaling for accurate dimensions
            });

            // Store the captured image and dimensions
            this.snapshotURL = canvas.toDataURL();
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;

            // Calculate scaling ratios
            this.captureScaleX =
                this.canvasWidth / document.documentElement.scrollWidth;
            this.captureScaleY =
                this.canvasHeight / document.documentElement.scrollHeight;

            // Create the magnifier lens
            this.createLens();

            // Add event listener for mouse movement
            document.addEventListener('mousemove', this.handleMouseMove);
            console.log(
                'PageMagnifier: Capture complete, magnifier activated.',
            );
        } catch (error) {
            console.error('PageMagnifier: Failed to capture the page.', error);
            this.isActive = false;
        }
    }

    /**
     * Stops the magnifier and cleans up resources.
     */
    public stop(): void {
        if (!this.isActive) return;
        this.isActive = false;

        // Remove the lens from the DOM
        if (this.lens?.parentElement) {
            this.lens.parentElement.removeChild(this.lens);
        }

        // Remove the mouse move event listener
        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    /**
     * Creates the magnifier lens and appends it to the DOM.
     */
    private createLens(): void {
        if (!this.snapshotURL) return;

        const lens = document.createElement('div');
        const lensRadius = this.lensDiameter / 2;

        // Calculate scaled background size
        const bgWidth =
            (document.documentElement.scrollWidth * this.zoomLevel) /
            this.captureScaleX;
        const bgHeight =
            (document.documentElement.scrollHeight * this.zoomLevel) /
            this.captureScaleY;

        // Style the lens
        lens.style.position = 'absolute';
        lens.style.pointerEvents = 'none'; // Allow mouse events to pass through
        lens.style.width = `${this.lensDiameter}px`;
        lens.style.height = `${this.lensDiameter}px`;
        lens.style.border = '2px solid #ccc';
        lens.style.borderRadius = '50%';
        lens.style.overflow = 'hidden';
        lens.style.backgroundImage = `url(${this.snapshotURL})`;
        lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`; // Scaled size
        lens.style.display = 'none'; // Hidden until the first mouse move
        lens.style.zIndex = '999999'; // Ensure it's on top of other elements

        // Append the lens to the body
        document.body.appendChild(lens);
        this.lens = lens;
    }

    /**
     * Handles mouse movement to position the lens and adjust the background.
     */
    private handleMouseMove = (e: MouseEvent): void => {
        if (!this.lens || !this.snapshotURL) return;

        // Get absolute coordinates with scroll offset
        const x = e.clientX + window.scrollX;
        const y = e.clientY + window.scrollY;
        const lensRadius = this.lensDiameter / 2;

        // Position the lens at the cursor
        this.lens.style.left = `${x - lensRadius}px`;
        this.lens.style.top = `${y - lensRadius}px`;

        // Calculate adjusted background position
        const bgPosX = -x * this.captureScaleX * this.zoomLevel + lensRadius;
        const bgPosY = -y * this.captureScaleY * this.zoomLevel + lensRadius;
        this.lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;

        // Ensure the lens is visible
        if (this.lens.style.display === 'none') {
            this.lens.style.display = 'block';
        }
    };
}
