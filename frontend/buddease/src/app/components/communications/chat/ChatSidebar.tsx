import React, { useState } from 'react';
import { useDispatch } from 'react-redux'; // Import useDispatch to dispatch actions
import { setChatSidebarOpen } from '../../state/redux/slices/SidebarSlice';

// Define a functional component that renders the chat sidebar
const ChatSidebar = () => {
  return (
    <div className="chat-sidebar">
      {/* Chat sidebar content */}
    </div>
  );
};

// Functional component to render a button that opens the chat sidebar
const ChatButton = () => {
  const dispatch = useDispatch();

  const openChatSidebar = () => {
    // Dispatch the action to open the chat sidebar
    dispatch(setChatSidebarOpen(true));
    console.log("Chat sidebar opened");
  };

  return (
    <button onClick={openChatSidebar}>
      Open Chat
    </button>
  );
};

// Functional component to render the chat feature (button + sidebar)
const ChatFeature = () => {
  const [chatSidebarOpen, setChatSidebarOpenLocally] = useState(false); // State to track the open/close state of the chat sidebar

  // Redux dispatch
  const dispatch = useDispatch();

  // Function to open the chat sidebar locally
  const openChatSidebar = () => {
    // Update the local state
    setChatSidebarOpenLocally(true);
    // Dispatch the action to open the chat sidebar globally
    dispatch(setChatSidebarOpen(true));
    console.log("Chat sidebar opened");
  };

  // Function to open the chat sidebar using the openChatSidebar function
  const openChatSidebarWithFunction = () => {
    openChatSidebar(); // Call the openChatSidebar function
  };

  return (
    <div>
      <ChatButton />
      {chatSidebarOpen && <ChatSidebar />}
      {/* Button to open the chat sidebar using the function */}
      <button onClick={openChatSidebarWithFunction}>
        Open Chat with Function
      </button>
    </div>
  );
};

export default ChatFeature;
