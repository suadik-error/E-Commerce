import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const fetchMessages = async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    try {
      const [profileRes, messagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/messages`, { credentials: "include" }),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setCurrentUser(profile);
      }

      if (!messagesRes.ok) {
        throw new Error("Failed to fetch internal chat messages");
      }

      const data = await messagesRes.json();
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message || "Failed to fetch messages");
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages({ initial: true });
    const timer = setInterval(() => fetchMessages(), 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    try {
      setSending(true);
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send message");
      }

      setDraft("");
      await fetchMessages();
    } catch (sendError) {
      setError(sendError.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
      ),
    [messages]
  );

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Internal Chat</h1>
        <button type="button" className="secondary-btn" onClick={() => fetchMessages()}>
          Refresh
        </button>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="chat-shell">
        <div className="chat-list" ref={scrollRef}>
          {sortedMessages.length === 0 ? (
            <p className="chat-empty">No internal messages yet. Start the conversation.</p>
          ) : (
            sortedMessages.map((message) => {
              const ownMessage = String(message.sender) === String(currentUser?._id);
              return (
                <article
                  key={message._id}
                  className={`chat-bubble ${ownMessage ? "mine" : "theirs"}`}
                >
                  <header>
                    <strong>{message.senderName || "Unknown"}</strong>
                    <small>
                      {message.senderRole} · {new Date(message.createdAt).toLocaleTimeString()}
                    </small>
                  </header>
                  <p>{message.content}</p>
                </article>
              );
            })
          )}
        </div>

        <form className="chat-input-row" onSubmit={sendMessage}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message to admins, managers, and agents..."
            maxLength={1000}
          />
          <button type="submit" className="primary-btn" disabled={sending || !draft.trim()}>
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
