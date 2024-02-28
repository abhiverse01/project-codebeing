



import React, { useState } from 'react';
import { callModel } from '../../api/callModelApi'; // Ensure this path is correct
import '../../App.css';
import './CodeGround.css';

export default function CodeGround() {
  const [isPaneOpen, setIsPaneOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(""); // New state for error messages

  const togglePane = () => setIsPaneOpen(!isPaneOpen);

  const handleMessageChange = (event) => setMessage(event.target.value);

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

  const userMessage = { sender: 'user', content: message };
    setConversation((prev) => [...prev, userMessage]); // Add user message to conversation

  
try {
    const response = await callModel(message);
    let modelMessageContent = response.generated_text || "Model did not return a response."; // Ensure this matches the API's response structure
    const modelMessage = { sender: 'model', content: modelMessageContent };
    setConversation((prev) => [...prev, modelMessage]); // Add model response to conversation
    setError(""); // Clear any existing errors
  } catch (error) {
    console.error("Error calling the model API:", error);
    setError("Failed to fetch model prediction. Please try again."); // Update error state
    const errorMessage = { sender: 'error', content: "Failed to fetch model prediction. Please try again." }; // Use an 'error' sender type
    setConversation((prev) => [...prev, errorMessage]);
  }

    setMessage(""); // Clear the input field after sending
};


  return (
    <div className="codeground-container">
      <button className="toggle-pane" onClick={togglePane}>
        {isPaneOpen ? '×' : '≡'}
      </button>
      <div className={`history-pane ${isPaneOpen ? 'open' : ''}`}>
        {/* Ensure content is displayed */}
        <div className="history-logo">Recents / History</div>
        {/* Display error message if any */}
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="chat-interface">

        <div className="messages-container">
          {conversation.map((msg, index) => {
            let messageClass = '';
            if (msg.sender === 'user') messageClass = 'user-message';
            else if (msg.sender === 'model') messageClass = 'model-message';
            else if (msg.sender === 'error') messageClass = 'error-message'; // Style differently for error messages

            return (
              <p key={index} className={messageClass}>
                <div className={`message ${messageClass}`}>
                  {msg.content}
                </div>
              </p>
            );
          })}
        </div>





        <div className="input-container">
          <input type="text" placeholder="Enter Your Prompt..." className="chat-input" value={message} onChange={handleMessageChange} />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
        


      </div>
    </div>
  );
}

