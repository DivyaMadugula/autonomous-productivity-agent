import { useState } from "react";
import MessageBubble from "./MessageBubble";

const ChatBox = ({ onSend }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);

    const reply = await onSend(input);
    setMessages([...newMessages, { role: "ai", text: reply }]);

    setInput("");
  };

  return (
    <div className="card">
      <h3>AI Assistant</h3>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg.text}
            role={msg.role}
          />
        ))}
      </div>

      <input
        type="text"
        placeholder="Ask something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatBox;