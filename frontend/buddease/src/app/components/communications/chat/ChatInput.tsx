// ChatInput.tsx
import React, { useState } from "react";
import { sanitizeInput } from "../../security/SanitizationFunctions";

interface ChatInputProps {
  controlled?: boolean; // Add a controlled prop to determine the mode
  value?: string; // Add this line to define the value prop
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
}

const ChatInput = ({
  controlled = true,
  value,
  onChange,
  onSubmit,
}: ChatInputProps) => {
  const [message, setMessage] = useState(controlled ? value || "" : "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedMessage = sanitizeInput(event.target.value); // Sanitize input value

    if (controlled && onChange) {
      onChange(event);
    }
    setMessage(sanitizedMessage);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (controlled && onSubmit) {
      onSubmit();
    }
    setMessage("");
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type your message..."
        value={controlled ? value : message}
        onChange={handleChange}
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default ChatInput;
