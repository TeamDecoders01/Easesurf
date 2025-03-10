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

            await new Promise((resolve) => setTimeout(resolve, 500));

            const canvas = await html2canvas(document.body, {
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight,
                scale: 1,
            });

            this.snapshotURL = canvas.toDataURL();
            this.canvasWidth = canvas.width;
            this.canvasHeight = canvas.height;

            this.captureScaleX =
                this.canvasWidth / document.documentElement.scrollWidth;
            this.captureScaleY =
                this.canvasHeight / document.documentElement.scrollHeight;

            this.createLens();

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

        if (this.lens?.parentElement) {
            this.lens.parentElement.removeChild(this.lens);
        }

        document.removeEventListener('mousemove', this.handleMouseMove);
    }

    /**
     * Creates the magnifier lens and appends it to the DOM.
     */
    private createLens(): void {
        if (!this.snapshotURL) return;

        const lens = document.createElement('div');
        const lensRadius = this.lensDiameter / 2;

        const bgWidth =
            (document.documentElement.scrollWidth * this.zoomLevel) /
            this.captureScaleX;
        const bgHeight =
            (document.documentElement.scrollHeight * this.zoomLevel) /
            this.captureScaleY;

        lens.style.position = 'absolute';
        lens.style.pointerEvents = 'none';
        lens.style.width = `${this.lensDiameter}px`;
        lens.style.height = `${this.lensDiameter}px`;
        lens.style.border = '2px solid #ccc';
        lens.style.borderRadius = '50%';
        lens.style.overflow = 'hidden';
        lens.style.backgroundImage = `url(${this.snapshotURL})`;
        lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        lens.style.display = 'none';
        lens.style.zIndex = '999999';

        document.body.appendChild(lens);
        this.lens = lens;
    }

    /**
     * Handles mouse movement to position the lens and adjust the background.
     */
    private handleMouseMove = (e: MouseEvent): void => {
        if (!this.lens || !this.snapshotURL) return;

        const x = e.clientX + window.scrollX;
        const y = e.clientY + window.scrollY;
        const lensRadius = this.lensDiameter / 2;

        this.lens.style.left = `${x - lensRadius}px`;
        this.lens.style.top = `${y - lensRadius}px`;

        const bgPosX = -x * this.captureScaleX * this.zoomLevel + lensRadius;
        const bgPosY = -y * this.captureScaleY * this.zoomLevel + lensRadius;
        this.lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;

        if (this.lens.style.display === 'none') {
            this.lens.style.display = 'block';
        }
    };
}
