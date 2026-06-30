import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import "./main.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
const SESSION_KEY = "rumblr-demo-session";

const demoStatement = {
  id: "demo-statement",
  number: 1,
  statement: "Public debates should reward people for changing their mind.",
};

const demoMismatches = [
  {
    id: "demo-mismatch-1",
    user1_id: "current-user",
    user2_id: "bob-disagrees",
    mismatch_score: 88,
    confidence: "high",
    shared_responses: 25,
  },
  {
    id: "demo-mismatch-2",
    user1_id: "carol-moderate",
    user2_id: "current-user",
    mismatch_score: 45,
    confidence: "medium",
    shared_responses: 20,
  },
];

const demoRequests = [
  {
    id: "demo-request-1",
    requester_id: "bob-disagrees",
    receiver_id: "current-user",
    requester_username: "bob_disagrees",
    receiver_username: "you",
    status: "pending",
    threat_level: "green",
  },
];

const demoRumbles = [
  {
    id: "demo-rumble-1",
    requester_id: "current-user",
    receiver_id: "bob-disagrees",
    status: "active",
    threat_level: "green",
  },
];

const demoMessages = [
  {
    id: "demo-message-1",
    sender_id: "bob-disagrees",
    content: "I think disagreement is useful only when both people stay specific.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-message-2",
    sender_id: "current-user",
    content: "Agreed. Rumblr should keep the debate focused on one claim at a time.",
    created_at: new Date().toISOString(),
  },
];

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function apiFetch(route, options = {}, token) {
  const response = await fetch(`${API_URL}/api${route}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Request failed");
  }

  return payload;
}

function getStatementText(statement) {
  return statement?.statement || statement?.text || statement?.content || "Statement unavailable";
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function getOtherUserId(mismatch, activeUserId) {
  if (mismatch.user1_id === activeUserId) return mismatch.user2_id;
  if (mismatch.user2_id === activeUserId) return mismatch.user1_id;
  return mismatch.user2_id || mismatch.user1_id || mismatch.id;
}

function getRequestView(request, activeUser) {
  const incoming = request.receiver_id === activeUser?.id;
  const outgoing = request.requester_id === activeUser?.id;
  const otherName = incoming
    ? request.requester_username || request.requester_id
    : request.receiver_username || request.receiver_id || request.requester_username || request.requester_id;

  return {
    incoming,
    outgoing,
    otherName,
    direction: incoming ? "Incoming" : outgoing ? "Outgoing" : "Request",
  };
}

function StatusMessage({ value }) {
  if (!value) return null;
  return <p className={`status ${value.kind || ""}`}>{value.message}</p>;
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(getSession);
  const [showDashboard, setShowDashboard] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    identifier: "",
    password: "",
    bio: "",
  });
  const [statement, setStatement] = useState(null);
  const [scores, setScores] = useState({ agreement_score: 3, importance_score: 3 });
  const [mismatches, setMismatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [rumbles, setRumbles] = useState([]);
  const [selectedRumbleId, setSelectedRumbleId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [answerCount, setAnswerCount] = useState(0);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = session?.accessToken;
  const activeUser = session?.user;
  const onboardingCompleted = Boolean(onboarding?.completed);
  const activeRumble = useMemo(
    () => rumbles.find((rumble) => rumble.id === selectedRumbleId) || rumbles[0],
    [rumbles, selectedRumbleId],
  );
  const opponentName = activeRumble
    ? activeRumble.requester_id === activeUser?.id
      ? activeRumble.receiver_username || activeRumble.receiver_id
      : activeRumble.requester_username || activeRumble.requester_id
    : "No opponent yet";
  const rumbleStatus = activeRumble?.status || "waiting";

  function showStatus(message, kind = "info") {
    setStatus({ message, kind });
  }

  function scrollToMismatches() {
    document.getElementById("mismatches-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function loadDashboard(showErrors = true) {
    if (!token) return;

    setLoading(true);
    try {
      const [
        nextStatement,
        nextMismatches,
        nextRequests,
        nextRumbles,
        nextBlockedUsers,
        nextOnboarding,
        nextResponses,
      ] = await Promise.all([
        apiFetch("/statements", {}, token).catch((error) => {
          if (showErrors) showStatus(error.message, "warn");
          return null;
        }),
        apiFetch("/mismatches", {}, token).catch(() => (showErrors ? demoMismatches : [])),
        apiFetch("/mismatches/requests", {}, token).catch(() => (showErrors ? demoRequests : { data: [] })),
        apiFetch("/rumbles", {}, token).catch(() => (showErrors ? { data: demoRumbles } : { data: [] })),
        apiFetch("/user/blocks", {}, token).catch(() => ({ data: [] })),
        apiFetch("/user/onboarding", {}, token).catch(() => null),
        apiFetch("/statements/responses", {}, token).catch(() => []),
      ]);

      setStatement(nextStatement || (showErrors ? demoStatement : null));
      setMismatches(asArray(nextMismatches));
      setRequests(asArray(nextRequests));
      const loadedRumbles = asArray(nextRumbles);
      setRumbles(loadedRumbles);
      setSelectedRumbleId((currentId) => currentId || loadedRumbles[0]?.id || "");
      setBlockedUsers(asArray(nextBlockedUsers));
      setOnboarding(nextOnboarding);
      setAnswerCount(asArray(nextResponses).length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && showDashboard) {
      loadDashboard();
    }
  }, [token, showDashboard]);

  useEffect(() => {
    async function loadMessages() {
      if (!token || !showDashboard || !activeRumble?.id) {
        setMessages([]);
        return;
      }

      const nextMessages = await apiFetch(`/rumbles/${activeRumble.id}/messages?page=1&limit=20`, {}, token).catch(
        () => ({ data: demoMessages }),
      );
      setMessages(asArray(nextMessages));
    }

    loadMessages();
  }, [token, showDashboard, activeRumble?.id]);

  useEffect(() => {
    if (!token || !showDashboard || !activeRumble?.id) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.emit("rumble:join", { rumbleId: activeRumble.id });

    socket.on("rumble:message", (event) => {
      const nextMessage = event?.data || event;
      if (!nextMessage?.id) return;

      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === nextMessage.id)) {
          return currentMessages;
        }

        return [...currentMessages, nextMessage];
      });
    });

    socket.on("connect_error", (error) => {
      showStatus(`Live rumble disconnected: ${error.message}`, "warn");
    });

    return () => {
      socket.emit("rumble:leave", { rumbleId: activeRumble.id });
      socket.disconnect();
    };
  }, [token, showDashboard, activeRumble?.id]);

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const body =
        authMode === "signup"
          ? {
              username: form.username,
              email: form.email,
              password: form.password,
              bio: form.bio,
              threat_levels: ["green"],
            }
          : {
              identifier: form.identifier,
              password: form.password,
            };
      const nextSession = await apiFetch(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setSession(nextSession);
      saveSession(nextSession);
      setShowDashboard(true);
      showStatus(`Signed in as ${nextSession.user?.username || "Rumblr user"}.`, "success");
    } catch (error) {
      showStatus(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
    saveSession(null);
    setStatement(null);
    setMismatches([]);
    setRequests([]);
    setRumbles([]);
    setMessages([]);
    setShowDashboard(false);
    showStatus("Signed out.", "info");
  }

  async function saveResponse(event) {
    event.preventDefault();

    if (!statement?.id || statement.id === "demo-statement") {
      showStatus("Demo answer recorded locally. Connect the API to persist it.", "warn");
      setStatement(demoStatement);
      return;
    }

    try {
      await apiFetch(
        `/statements/${statement.id}/respond`,
        {
          method: "POST",
          body: JSON.stringify({
            agreement_score: Number(scores.agreement_score),
            importance_score: Number(scores.importance_score),
          }),
        },
        token,
      );
      await loadDashboard(false);
      showStatus("Response saved.", "success");
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  async function createRequest(mismatch) {
    const userId = getOtherUserId(mismatch, activeUser?.id);

    try {
      await apiFetch(
        `/mismatches/${userId}`,
        {
          method: "POST",
          body: JSON.stringify({ threat_level: "green" }),
        },
        token,
      );
      showStatus("Rumble request sent.", "success");
      await loadDashboard(false);
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  async function updateRequest(requestId, action) {
    try {
      await apiFetch(`/mismatches/${requestId}/${action}`, { method: "POST" }, token);
      showStatus(`Request ${action}ed.`, "success");
      await loadDashboard(false);
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!messageText.trim() || !activeRumble?.id) return;

    try {
      await apiFetch(
        `/rumbles/${activeRumble.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: messageText.trim() }),
        },
        token,
      );
      setMessageText("");
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  async function terminateRumble() {
    if (!activeRumble?.id) return;

    try {
      await apiFetch(`/rumbles/${activeRumble.id}/terminate`, { method: "PUT" }, token);
      showStatus("Rumble terminated.", "success");
      await loadDashboard(false);
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  async function blockUser(userId) {
    if (!userId) return;

    try {
      await apiFetch(`/user/blocks/${userId}`, { method: "POST" }, token);
      showStatus("User blocked.", "success");
      await loadDashboard(false);
    } catch (error) {
      showStatus(error.message, "error");
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Rumblr customer demo</p>
          <h1>Disagree first. Debate with structure.</h1>
        </div>
        {session && showDashboard ? (
          <div className="account">
            <span>{activeUser?.username || "Signed in"}</span>
            <button className="ghost" onClick={logout}>
              Log out
            </button>
          </div>
        ) : null}
      </header>

      <StatusMessage value={status} />

      {session && showDashboard ? (
        <section className="dashboard">
          <section className="panel span-2">
            <div className="panel-header">
              <div>
                <h2>Opinion onboarding</h2>
                {onboarding ? (
                  <p className="subtle">
                    Answered {onboarding.answeredCount} of {onboarding.requiredCount} onboarding questions
                  </p>
                ) : null}
              </div>
              <button className="ghost" onClick={() => loadDashboard(false)}>
                Refresh
              </button>
            </div>

            {onboardingCompleted ? (
              <div className="complete-state">
                <strong>Onboarding completed</strong>
                <p>Your answers are saved. Next, find someone who answered differently and send a rumble request.</p>
                <div className="actions">
                  <button type="button" onClick={scrollToMismatches}>
                    Find mismatches
                  </button>
                  <button className="ghost" type="button" onClick={() => loadDashboard(false)}>
                    Refresh matches
                  </button>
                </div>
              </div>
            ) : (
              <form className="statement-form" onSubmit={saveResponse}>
                <p className="statement">{getStatementText(statement)}</p>
                <div className="sliders">
                  <label>
                    Agreement
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={scores.agreement_score}
                      onChange={(event) => setScores({ ...scores, agreement_score: event.target.value })}
                    />
                    <strong>{scores.agreement_score}/5</strong>
                  </label>
                  <label>
                    Importance
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={scores.importance_score}
                      onChange={(event) => setScores({ ...scores, importance_score: event.target.value })}
                    />
                    <strong>{scores.importance_score}/5</strong>
                  </label>
                </div>
                <button>Save response</button>
              </form>
            )}
          </section>

          <section className="panel">
            <h2>Backend snapshot</h2>
            <div className="stats">
              <Stat label="Mismatches" value={mismatches.length} />
              <Stat label="Answers saved" value={answerCount} />
              <Stat
                label="Onboarding"
                value={onboarding ? `${onboarding.answeredCount}/${onboarding.requiredCount}` : "0/10"}
              />
              <Stat label="Requests" value={requests.length} />
              <Stat label="Active rumbles" value={rumbles.length} />
              <Stat label="Blocked" value={blockedUsers.length} />
            </div>
          </section>

          <section className="panel span-2" id="mismatches-panel">
            <h2>Mismatches</h2>
            {onboardingCompleted && !mismatches.length ? (
              <p className="empty">
                Onboarding is complete. Create or log in as another user and answer the same statements differently,
                then refresh matches.
              </p>
            ) : null}
            <div className="list">
              {mismatches.map((mismatch) => {
                const otherUserId = getOtherUserId(mismatch, activeUser?.id);

                return (
                  <article className="row" key={mismatch.id || `${mismatch.user1_id}-${mismatch.user2_id}`}>
                    <div>
                      <strong>{otherUserId}</strong>
                      <p>
                        {mismatch.confidence || "unknown"} confidence - {mismatch.shared_responses || 0} shared
                        answers
                      </p>
                    </div>
                    <div className="actions">
                      <span className="score">{mismatch.mismatch_score ?? 0}%</span>
                      <button onClick={() => createRequest(mismatch)}>Start request</button>
                      <button className="ghost danger" onClick={() => blockUser(otherUserId)}>
                        Block
                      </button>
                    </div>
                  </article>
                );
              })}
              {mismatches.length ? null : <p className="empty">No mismatches yet.</p>}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Requests</h2>
                <p className="subtle">Incoming requests can be accepted. Outgoing requests wait for the other user.</p>
              </div>
              <button className="ghost" onClick={() => loadDashboard(false)}>
                Refresh
              </button>
            </div>
            <div className="list compact">
              {requests.map((request) => {
                const requestView = getRequestView(request, activeUser);

                return (
                  <article className="mini-row" key={request.id}>
                    <div>
                      <strong>{requestView.otherName}</strong>
                      <span>
                        {requestView.direction} - {request.status} - {request.threat_level}
                      </span>
                    </div>
                    {requestView.incoming && request.status === "pending" ? (
                      <div className="actions">
                        <button onClick={() => updateRequest(request.id, "accept")}>Accept</button>
                        <button className="ghost" onClick={() => updateRequest(request.id, "decline")}>
                          Decline
                        </button>
                      </div>
                    ) : null}
                    {requestView.outgoing && request.status === "pending" ? (
                      <span className="pill">Waiting for accept</span>
                    ) : null}
                  </article>
                );
              })}
              {requests.length ? null : <p className="empty">No requests yet.</p>}
            </div>
          </section>

          <section className="rumble-panel span-3">
            <div className="rumble-top">
              <div>
                <p className="eyebrow">Live rumble</p>
                <h2>Structured debate room</h2>
              </div>
              <div className="actions">
                <select value={activeRumble?.id || ""} onChange={(event) => setSelectedRumbleId(event.target.value)}>
                  {rumbles.length ? null : <option value="">No active rumble</option>}
                  {rumbles.map((rumble) => (
                    <option value={rumble.id} key={rumble.id}>
                      {rumble.id}
                    </option>
                  ))}
                </select>
                <button className="ghost danger" onClick={terminateRumble} disabled={!activeRumble}>
                  Terminate
                </button>
              </div>
            </div>

            <div className="rumble-meta">
              <div>
                <span>Opponent</span>
                <strong>{opponentName}</strong>
              </div>
              <div>
                <span>Threat level</span>
                <strong>{activeRumble?.threat_level || "green"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{rumbleStatus}</strong>
              </div>
            </div>

            <div className="chat-shell">
              <div className="chat">
                {messages.map((message) => (
                  <div
                    className={message.sender_id === activeUser?.id ? "message mine" : "message"}
                    key={message.id || message.created_at}
                  >
                    <span>{message.sender_id === activeUser?.id ? "You" : opponentName}</span>
                    <p>{message.content}</p>
                  </div>
                ))}
                {messages.length ? null : (
                  <div className="chat-empty">
                    <strong>{activeRumble ? "Ready for the first message" : "Waiting for an active rumble"}</strong>
                    <p>
                      {activeRumble
                        ? "The room is open. Start with one clear claim or question."
                        : "Once an incoming request is accepted and the backend marks it active, messages will appear here."}
                    </p>
                  </div>
                )}
              </div>
              <form className="message-form" onSubmit={sendMessage}>
                <input value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a message" />
                <button disabled={!activeRumble}>Send</button>
              </form>
            </div>
          </section>
        </section>
      ) : (
        <section className="auth-grid">
          <div className="intro-panel">
            <h2>Backend flow preview</h2>
            <p>A compact customer view of the path from opinion statements to mismatched debates.</p>
            <div className="flow-list">
              {["Sign up", "Answer", "Mismatch", "Request", "Rumble", "Block"].map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </div>

          {session ? (
            <section className="panel resume-panel">
              <h2>Welcome back, {activeUser?.username || "Rumblr user"}</h2>
              <p className="subtle">Start from the customer-facing main page, then continue into the backend demo when ready.</p>
              <div className="actions">
                <button type="button" onClick={() => setShowDashboard(true)}>
                  Continue to demo
                </button>
                <button className="ghost" type="button" onClick={logout}>
                  Log out
                </button>
              </div>
            </section>
          ) : (
            <form className="panel" onSubmit={submitAuth}>
              <div className="segmented">
                <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
                  Login
                </button>
                <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => setAuthMode("signup")}>
                  Sign up
                </button>
              </div>

              {authMode === "signup" ? (
                <>
                  <label>
                    Username
                    <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
                  </label>
                  <label>
                    Email
                    <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  </label>
                  <label>
                    Bio
                    <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
                  </label>
                </>
              ) : (
                <label>
                  Email or username
                  <input value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} />
                </label>
              )}

              <label>
                Password
                <div className="password-row">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                  <button className="ghost" type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button disabled={loading}>{loading ? "Working..." : authMode === "signup" ? "Create account" : "Log in"}</button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
