import { NotificationData } from '@/app/state/redux/slices/NofiticationsSlice'
import React from 'react';

interface NotificationDisplayProps {
    notifications: NotificationData[]; // Define the prop here
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ notifications }) => {
    return (
        <div>
            <h2>Notifications</h2>
            {notifications.map((notification) => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    <p>{notification.content}</p>
                </div>
            ))}
        </div>
    );
};

export default NotificationDisplay;
