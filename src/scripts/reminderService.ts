const waterReminder = 'Time to drink water!';
const stretchReminder = 'Time to stretch and move!';

let waterIntervalId: number | undefined;
let stretchIntervalId: number | undefined;

export function startReminders(callback: (message: string) => void) {
    waterIntervalId = window.setInterval(() => {
        alert(waterReminder);
        callback(waterReminder);
    }, 10000);

    stretchIntervalId = window.setInterval(() => {
        alert(stretchReminder);
        callback(stretchReminder);
    }, 15000);
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
