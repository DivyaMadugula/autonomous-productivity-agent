import "../styles/assistant.css";
import { useState } from "react";
import API from "../api/api"
import toast from "react-hot-toast";
import { showNotification } from "../utils/notifications";

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "How can I help you today?",
    },
  ]);
const [input, setInput] = useState(""); 
  const sendMessage = async (text) => {
  if (!text) return;

  // Show user message immediately
  setMessages((prev) => [
    ...prev,
    { role: "user", text },
    { role: "ai", text: "Thinking..." },
  ]);

  try {
    const res = await API.post("/assistant", {
      message: text,
    });

    // Replace "Thinking..." with real response
    setMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "ai", text: res.data.reply },
    ]);
    toast.success("Aura replied 🤖");
  } catch (err) {
    console.error(err);

    setMessages((prev) => [
      ...prev.slice(0, -1),
      { role: "ai", text: "Something went wrong 😅" },
    ]);
    toast.error("AI failed ❌");
  }
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
            <div className="prompt-card"
            onClick={() => sendMessage("Optimize my daily schedule")}
            >
              Optimize your daily schedule
            </div>
            <div className="prompt-card"
            onClick={() => sendMessage("Analyze my productivity patterns")}>

              Analyze productivity patterns
            </div>
            <div className="prompt-card"
            onClick={() => sendMessage("Suggest improvements based on my habits")}
            >
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
  value={input}
  placeholder="Ask Aura anything about your productivity..."
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage(input);
      setInput("");
    }
  }}
/>

<button
  onClick={() => {
    sendMessage(input);
    setInput("");
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