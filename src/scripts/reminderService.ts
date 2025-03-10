// src/reminderService.ts
const waterReminder = 'Time to drink water!';
const stretchReminder = 'Time to stretch and move!';

let waterIntervalId: number | undefined;
let stretchIntervalId: number | undefined;

export function startReminders(callback: (message: string) => void) {
    // For demonstration purposes, we use short intervals.
    // Adjust these intervals (e.g. 3600000ms for water and 1800000ms for stretching) as needed.
    waterIntervalId = window.setInterval(() => {
        alert(waterReminder); // Using alert instead of callback
        callback(waterReminder); // Still call the callback to update UI
    }, 10000); // every 10 seconds

    stretchIntervalId = window.setInterval(() => {
        alert(stretchReminder); // Using alert instead of callback
        callback(stretchReminder); // Still call the callback to update UI
    }, 15000); // every 15 seconds
}

export function stopReminders() {
    if (waterIntervalId) {
        clearInterval(waterIntervalId);
        waterIntervalId = undefined;
    }
    if (stretchIntervalId) {
        clearInterval(stretchIntervalId);
        stretchIntervalId = undefined;
    }
}
