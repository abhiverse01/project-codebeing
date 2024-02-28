import React, { useState } from 'react';
import '../../App.css';
import './CodeGround.css'; // Importing the custom CSS for CodeGround

export default function CodeGround() {
  const [isPaneOpen, setIsPaneOpen] = useState(true);
  const [message, setMessage] = useState(""); // State to hold the typed message

  // Function to toggle the side pane
  const togglePane = () => {
    setIsPaneOpen(!isPaneOpen);
  };

  // Update message state on input change
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Placeholder function for sending the message
  const sendMessage = () => {
    console.log("Sending message:", message);
    // Here i would typically handle the message sending logic,
    // such as updating state, sending to an API, etc.
    setMessage(""); // Clear the input field after sending
  };

  return (
    <div className="codeground-container">
      <button className="toggle-pane" onClick={togglePane}>
        {isPaneOpen ? '×' : '≡'} {/* Use symbols here */}
      </button>
      <div className={`history-pane ${isPaneOpen ? 'open' : ''}`}>
        <div className="history-logo">{isPaneOpen ? 'Recents / History' : 'H'}</div>
        {/* Expanded history content goes here */}
      </div>
      <div className="chat-interface">
        <div className="messages-container">
          <p>What do you wish to build today!</p>
          {/* Chat messages will be dynamically added here */}
        </div>
        <div className="input-container"> {/* Add this wrapper for input and button */}
          <input
            type="text"
            placeholder="Enter Your Prompt..."
            className="chat-input"
            value={message} // Controlled component
            onChange={handleMessageChange}
          />
          <button className="send-button" onClick={sendMessage}>Send</button> {/* Send button */}
        </div>
      </div>
    </div>
  );
}