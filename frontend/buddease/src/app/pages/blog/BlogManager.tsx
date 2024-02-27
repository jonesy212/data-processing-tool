// BlogManager.tsx
import { useDispatch, useSelector } from 'react-redux';
import BlogOverview from './BlogOverview';
import BlogPosts from './BlogPosts';
import NewBlogPostForm from './NewBlogPostForm';
import NotificationDisplay from './NotificationDisplay';
import { addNotification, selectNotifications } from './NotificationSlice';

const BlogManager = () => {
  // Redux state and dispatch setup
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  // Function to send a notification using Redux
  const sendReduxNotification = () => {
    dispatch(addNotification({
      id: '1',
      date: new Date(),
      message: 'New notification added',
      createdAt: new Date(),
      type: 'Info',
      content: 'This is a test notification',
    }));
  };

  return (
    <div>
      <BlogOverview />
      <NewBlogPostForm />
      <BlogPosts />
      {/* Add other blog components as needed */}

      <button onClick={sendReduxNotification}>Send Redux Notification</button>
      <NotificationDisplay notifications={notifications} />
    </div>
  );
};

export default BlogManager;
