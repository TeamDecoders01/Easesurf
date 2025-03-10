import { useState, useEffect, useCallback } from 'react';
import { startReminders, stopReminders } from '../scripts/reminderService';

interface ReminderServicesProps {
    onStatusChange?: (isActive: boolean) => void;
    onReminder?: (message: string) => void;
    autoStart?: boolean;
}

const ReminderServices: React.FC<ReminderServicesProps> = ({
    onStatusChange,
    onReminder,
    autoStart = false,
}) => {
    const [isActive, setIsActive] = useState<boolean>(autoStart);
    const [lastMessage, setLastMessage] = useState<string>('');
    const [isExtensionAvailable, setIsExtensionAvailable] =
        useState<boolean>(true);
    const [notificationPermission, setNotificationPermission] =
        useState<string>('default');

    // Check if Chrome extension is available and request notification permission
    useEffect(() => {
        // Check if we're in a browser environment and if Chrome extension API is available
        const extensionAvailable =
            typeof chrome !== 'undefined' && !!chrome.runtime;
        setIsExtensionAvailable(extensionAvailable);

        // If extension is not available, check for Notification API support
        if (!extensionAvailable && 'Notification' in window) {
            setNotificationPermission(Notification.permission);

            // Request permission if not granted yet
            if (Notification.permission !== 'granted') {
                Notification.requestPermission().then((permission) => {
                    setNotificationPermission(permission);
                });
            }
        }
    }, []);

    // Function to show notifications using the appropriate method
    const showNotification = useCallback(
        (message: string) => {
            // First try to use the extension API if available
            if (isExtensionAvailable && chrome?.runtime) {
                chrome.runtime.sendMessage({
                    type: 'SHOW_NOTIFICATION',
                    payload: { message },
                });
            }
            // Fall back to Web Notification API
            else if (
                'Notification' in window &&
                notificationPermission === 'granted'
            ) {
                new Notification('Health Reminder', {
                    body: message,
                    icon: '/icon128.png', // Make sure this path is correct
                });
            }

            // Update the UI regardless of notification method
            setLastMessage(message);
            if (onReminder) {
                onReminder(message);
            }
        },
        [isExtensionAvailable, notificationPermission, onReminder],
    );

    // Initialize component state
    useEffect(() => {
        // If autoStart is true, start reminders
        if (autoStart) {
            startReminders(showNotification);
            if (onStatusChange) {
                onStatusChange(true);
            }
        }

        // Clean up on unmount
        return () => {
            if (isActive) {
                stopReminders();
            }
        };
    }, [autoStart, onStatusChange, showNotification, isActive]);

    const toggleReminders = () => {
        const newActiveState = !isActive;

        if (newActiveState) {
            startReminders(showNotification);
        } else {
            stopReminders();
        }

        setIsActive(newActiveState);

        if (onStatusChange) {
            onStatusChange(newActiveState);
        }
    };

    return (
        <div className="reminder-services">
            <h2 className="text-xl font-bold mb-2">
                <strong>Health Reminders</strong>
            </h2>

            {!isExtensionAvailable && notificationPermission !== 'granted' && (
                <div className="mb-3 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    ⚠️ Notification permission is required for reminders to
                    appear as system notifications.
                </div>
            )}

            <div className="reminder-controls space-y-3">
                <button
                    type="button"
                    onClick={toggleReminders}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                    {isActive ? 'Stop Reminders' : 'Start Reminders'}
                </button>

                <div className="reminder-status">
                    Status:{' '}
                    <span
                        className={
                            isActive
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                        }
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {lastMessage && (
                    <div className="last-reminder">
                        Last reminder: <strong>{lastMessage}</strong>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReminderServices;
