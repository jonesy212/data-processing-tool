// BlogManager.tsx
import { AndroidBlogPosts } from '@/app/pages/blog/AIoSBlogPosts';
import BlogOverview from '@/app/pages/blog/BlogOverview';
import { logData } from '@/app/services/NotificationService';
import { NotificationContext, NotificationType } from '@/app/state/context/NotificationContext';
import { addNotification } from '@/app/state/redux/slices/NofiticationsSlice';
import NewBlogPostForm from '@/app/pages/blog/NewBlogPostForm';
import NotificationDisplay from '@/app/pages/blog/NotificationDisplay';
import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';

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
