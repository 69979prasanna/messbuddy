import { useState } from "react";

export default function AIChat() {
  const api = process.env.REACT_APP_APIKEY
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hey, I’m MessBuddy AI. What should I eat today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${api}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "ai", text: data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "⚠️ Server error. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
   
      <button
        className="btn btn-primary rounded-circle position-fixed"
        style={{ bottom: 25, right: 25, width: 56, height: 56, zIndex: 1050 }}
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {open && (
        <div
          className="card bg-dark text-light position-fixed shadow"
          style={{
            bottom: 90,
            right: 25,
            width: 320,
            height: 420,
            zIndex: 1050
          }}
        >
     
          <div className="card-header d-flex justify-content-between align-items-center">
            <span className="fw-semibold">MessBuddy AI</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

   
          <div
            className="card-body d-flex flex-column gap-2 overflow-auto"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  m.role === "user"
                    ? "bg-primary text-white align-self-end"
                    : "bg-secondary text-white align-self-start"
                }`}
                style={{ maxWidth: "80%", fontSize: 14 }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="bg-secondary p-2 rounded align-self-start">
                Typing…
              </div>
            )}
          </div>

      
          <div className="card-footer d-flex gap-2">
            <input
              className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
