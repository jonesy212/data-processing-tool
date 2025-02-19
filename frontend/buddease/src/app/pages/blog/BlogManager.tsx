import { logData } from '@/app/components/notifications/NotificationService';
import { addNotification } from '@/app/components/support/NofiticationsSlice';
import { NotificationContext, NotificationType } from '@/app/components/support/NotificationContext';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { AndroidBlogPosts } from './AIoSBlogPosts';
import BlogOverview from './BlogOverview';
import NewBlogPostForm from './NewBlogPostForm';
import NotificationDisplay from './NotificationDisplay';

interface BlogManagerProps { }

const BlogManager: React.FC<BlogManagerProps> = () => {
    // Redux state and dispatch setup
    const dispatch = useDispatch();
  // Retrieve notifications from NotificationContext
  const { notifications } = useContext(NotificationContext);

    // Function to send a notification using Redux
    const sendReduxNotification = () => {
        dispatch(addNotification({
            id: '1',
            date: new Date(),
            message: 'New notification added',
            createdAt: new Date(),
            type: 'Info' as NotificationType,
            content: 'This is a test notification',
            sendStatus: 'Sent',
            completionMessageLog: logData
        }));
    };

    return (
        <div>
            <BlogOverview
                title={"New Blog Post"}
                content={"This is a new blog post"}
                author={"John Doe"}
                date={new Date(Date.now())}
            />
            <NewBlogPostForm />
            <AndroidBlogPosts />
            {/* Add other blog components as needed */}

            <button onClick={sendReduxNotification}>Send Redux Notification</button>
            {/* Pass the notifications prop to NotificationDisplay */}
            <NotificationDisplay notifications={notifications} />
        </div>
    );
};

export default BlogManager;
