import React, { useState, useEffect, useRef } from "react"
import "../../styles/AIChat.css"

export default function AIChat() {
  const api = process.env.REACT_APP_APIKEY || "http://localhost:5000/api"
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hey! I’m **MessBuddy AI**, your personal campus food companion. 🍛\n\nAsk me about today's menu, meal schedules, open messes, food recommendations, or help writing reviews!",
    },
  ])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Current authenticated user
  const user = JSON.parse(localStorage.getItem("user") || "null")
  const token = localStorage.getItem("token")

  // Suggested Prompts
  const suggestedPrompts = [
    { label: "🍛 What should I eat?", prompt: "What should I eat right now?" },
    { label: "💰 Under ₹80", prompt: "Suggest something under ₹80." },
    { label: "⭐ Best mess for lunch?", prompt: "Which mess is best for lunch?" },
    { label: "📅 What's for dinner?", prompt: "What's on the schedule for dinner today?" },
    { label: "🥗 Suggest healthy", prompt: "Suggest something healthy from the menu." },
    { label: "❤️ My favorites", prompt: "Recommend something based on my favorites and preferences." },
  ]

  // Auto-scroll to bottom on message change
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading, open])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  // Listen for external open requests (e.g. from PlaceDetails Next Meal section)
  useEffect(() => {
    const handleOpenChat = () => {
      setOpen(true)
    }
    window.addEventListener("messbuddy:open-ai-chat", handleOpenChat)
    return () => window.removeEventListener("messbuddy:open-ai-chat", handleOpenChat)
  }, [])

  // Load conversation history on first open if logged in
  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return
      try {
        const res = await fetch(`${api}/ai/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            const formatted = data.messages.map((m) => ({
              role: m.role === "assistant" ? "ai" : "user",
              text: m.content,
            }))
            setMessages(formatted)
          }
        }
      } catch (err) {
        console.warn("Could not load AI history:", err)
      }
    }

    if (open && messages.length <= 1) {
      fetchHistory()
    }
  }, [open, token, api])

  // Send message
  const handleSendMessage = async (textToSend = input) => {
    const query = typeof textToSend === "string" ? textToSend.trim() : ""
    if (!query || loading) return

    const userMsg = { role: "user", text: query }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const headers = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const res = await fetch(`${api}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: query }),
      })

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }

      const data = await res.json()
      const aiReply = data.reply || "I didn't catch that. Could you try asking again?"

      setMessages((prev) => [...prev, { role: "ai", text: aiReply }])
    } catch (err) {
      console.error("Chat error:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Sorry, I had trouble connecting to the campus food server. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Clear conversation history
  const handleClearChat = async () => {
    if (!window.confirm("Clear your AI chat history?")) return

    try {
      if (token) {
        await fetch(`${api}/ai/history`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
      setMessages([
        {
          role: "ai",
          text: `Chat cleared! Hey ${user ? user.username : "there"}, how can I help you discover campus food today? 🍽️`,
        },
      ])
    } catch (err) {
      console.error("Clear chat error:", err)
    }
  }

  // Copy text to clipboard (e.g. for review drafts)
  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Render markdown-like simple formatting (bold, linebreaks, bullet points)
  const renderFormattedText = (text) => {
    if (!text) return null
    const lines = text.split("\n")

    return lines.map((line, idx) => {
      // Process bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g)
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>
        }
        return part
      })

      // Check if bullet point or blockquote
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ") || line.trim().startsWith("* ")) {
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "2px 0" }}>
            <span>•</span>
            <div>{renderedParts}</div>
          </div>
        )
      }

      if (line.trim().startsWith("> ")) {
        return (
          <blockquote key={idx}>
            {line.replace(/^>\s*/, "")}
          </blockquote>
        )
      }

      return (
        <p key={idx} style={{ margin: line ? "3px 0" : "6px 0" }}>
          {renderedParts}
        </p>
      )
    })
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        className="ai-chat-launcher"
        onClick={() => setOpen(!open)}
        aria-label="Open MessBuddy AI Chat"
        title="Chat with MessBuddy AI"
      >
        <span>🤖</span>
        <span className="ai-chat-launcher-badge" title="AI Online"></span>
      </button>

      {/* Floating Chat Modal */}
      {open && (
        <aside className="ai-chat-window" aria-label="MessBuddy AI Chat Window">
          {/* Header */}
          <header className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-avatar-box">
                🤖
                <span className="ai-avatar-dot" title="Online"></span>
              </div>
              <div className="ai-header-titles">
                <div className="ai-header-title-row">
                  <h3 className="ai-title-text">MessBuddy AI</h3>
                  {user ? (
                    <span className="ai-memory-badge" title="Personalized user memory is active">
                      Memory Active 🧠
                    </span>
                  ) : (
                    <span className="ai-memory-badge" style={{ borderColor: "#64748b", color: "#94a3b8" }}>
                      Guest
                    </span>
                  )}
                </div>
                <p className="ai-subtitle-text">
                  Your personal campus food companion
                </p>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                className="ai-action-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                🗑️
              </button>
              <button
                className="ai-action-btn close"
                onClick={() => setOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Suggested Prompts Bar */}
          <nav className="ai-suggested-prompts-shelf" aria-label="Suggested Prompts">
            {suggestedPrompts.map((sp, idx) => (
              <button
                key={idx}
                className="ai-prompt-pill"
                onClick={() => handleSendMessage(sp.prompt)}
              >
                {sp.label}
              </button>
            ))}
          </nav>

          {/* Messages Body */}
          <div className="ai-chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg-row ${m.role}`}>
                <div className="ai-msg-avatar" aria-hidden="true">
                  {m.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="ai-msg-bubble">
                  {renderFormattedText(m.text)}

                  {/* Copy Button for AI responses */}
                  {m.role === "ai" && m.text.length > 50 && (
                    <button
                      className="ai-copy-btn"
                      onClick={() => handleCopyText(m.text, i)}
                      title="Copy response"
                    >
                      {copiedIndex === i ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="ai-msg-row ai">
                <div className="ai-msg-avatar" aria-hidden="true">
                  🤖
                </div>
                <div className="ai-typing-indicator" aria-label="AI is thinking">
                  <span className="ai-typing-dot"></span>
                  <span className="ai-typing-dot"></span>
                  <span className="ai-typing-dot"></span>
                  <span className="ai-typing-text">MessBuddy is checking menus...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <footer className="ai-chat-footer">
            <div className="ai-chat-input-wrapper">
              <input
                ref={inputRef}
                className="ai-chat-input"
                placeholder={user ? "Ask anything about campus food..." : "Ask about today's food, hours, or menu..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={loading}
              />
            </div>
            <button
              className="ai-chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              title="Send"
            >
              ➤
            </button>
          </footer>
        </aside>
      )}
    </>
  )
}
