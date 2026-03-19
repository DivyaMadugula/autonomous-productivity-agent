import "../styles/assistant.css";
import { useState } from "react";

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "How can I help you today?",
    },
  ]);

  const sendMessage = (text) => {
    if (!text) return;

    setMessages([
      ...messages,
      { role: "user", text },
      { role: "ai", text: "I'm analyzing your productivity patterns..." },
    ]);
  };

  return (
    <>
      {/* Header */}
      <div className="assistant-header">
        <h1>AI Assistant</h1>
        <p>Chat with Aura to manage your productivity</p>
      </div>

      <div className="assistant-layout">

        {/* LEFT - CHAT */}
        <div className="assistant-chat card">
          {/* Suggested Prompts */}
          <div className="suggested-prompts">
            <div className="prompt-card">
              Optimize your daily schedule
            </div>
            <div className="prompt-card">
              Analyze productivity patterns
            </div>
            <div className="prompt-card">
              Suggest improvements based on habits
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-box">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask Aura anything about your productivity..."
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage(e.target.value)
              }
            />
            <button
              onClick={() => {
                const input = document.querySelector(".chat-input input");
                sendMessage(input.value);
                input.value = "";
              }}
            >
              ➤
            </button>
          </div>
        </div>

        {/* RIGHT - CAPABILITIES */}
        <div className="assistant-side card">
          <h3>Capabilities</h3>
          <ul>
            <li>✔ Goal decomposition</li>
            <li>✔ Smart scheduling</li>
            <li>✔ Behavior analysis</li>
            <li>✔ Productivity insights</li>
            <li>✔ Adaptive planning</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Assistant;