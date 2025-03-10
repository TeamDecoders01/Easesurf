let scrollInterval: ReturnType<typeof setInterval> | null = null;
let isScrolling = false;

export function startAutoScroll(speed = 1) {
    if (isScrolling) return;
    isScrolling = true;
    scrollInterval = setInterval(() => {
        window.scrollBy(1, speed);
    }, 50);
}

export function stopAutoScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
        isScrolling = false;
    }
}
