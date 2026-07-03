import "./main.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const SOCKET_URL = API_URL;
const SESSION_KEY = "rumblr-demo-session";

// --- Session ---

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

// --- API ---

async function apiFetch(route, options = {}, token) {
  const res = await fetch(`${API_URL}/api${route}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || payload?.message || "Request failed");
  return payload;
}

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

// --- State ---

const state = {
  session: getSession(),
  showDashboard: false,
  authMode: "login",
  showPassword: false,
  statement: null,
  agreementScore: 3,
  importanceScore: 3,
  mismatches: [],
  requests: [],
  rumbles: [],
  selectedRumbleId: "",
  messages: [],
  blockedUsers: [],
  threatLevelSelections: {},
  onboarding: null,
  answerCount: 0,
  loading: false,
  socket: null,
};

// --- DOM helpers ---

const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Status ---

let statusTimer = null;

function showStatus(message, kind = "info") {
  const el = $("status-msg");
  el.textContent = message;
  el.className = `status ${kind}`;
  el.hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    el.hidden = true;
  }, 4000);
}

// --- Loading ---

function setLoading(loading) {
  state.loading = loading;
  $("btn-auth-submit").disabled = loading;
  $("btn-submit-response").disabled = loading || !state.statement;
  $("btn-send-message").disabled = loading || !getActiveRumble();
  $("btn-terminate-rumble").disabled = loading || !getActiveRumble();
}

// --- Derived state ---

function getActiveRumble() {
  return state.rumbles.find((r) => r.id === state.selectedRumbleId) || state.rumbles[0] || null;
}

function getOpponentName(rumble) {
  if (!rumble) return "No opponent yet";
  const userId = state.session?.user?.id;
  return rumble.requester_id === userId
    ? rumble.receiver_username || rumble.receiver_id
    : rumble.requester_username || rumble.requester_id;
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

// --- View routing ---

function updateView() {
  const { session, showDashboard } = state;
  const inDashboard = Boolean(session && showDashboard);

  $("auth-view").hidden = inDashboard;
  $("dashboard-view").hidden = !inDashboard;
  $("account-bar").hidden = !inDashboard;

  if (inDashboard) {
    $("account-username").textContent = session.user?.username || "Signed in";
  } else {
    const hasSession = Boolean(session);
    $("auth-form").hidden = hasSession;
    $("resume-panel").hidden = !hasSession;
    if (hasSession) {
      $("resume-heading").textContent = `Welcome back, ${session.user?.username || "Rumblr user"}`;
    }
  }
}

// --- Auth mode ---

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";

  $("btn-login-tab").classList.toggle("active", !isSignup);
  $("btn-signup-tab").classList.toggle("active", isSignup);

  $("field-username").hidden = !isSignup;
  $("field-email").hidden = !isSignup;
  $("field-bio").hidden = !isSignup;
  $("field-threat-levels").hidden = !isSignup;
  $("field-identifier").hidden = isSignup;

  $("field-threat-levels")
    .querySelectorAll("input")
    .forEach((input) => (input.checked = input.value === "green"));

  $("input-username").value = "";
  $("input-email").value = "";
  $("input-bio").value = "";
  $("input-identifier").value = "";
  $("input-password").value = "";

  $("input-password").autocomplete = isSignup ? "new-password" : "current-password";
  $("btn-auth-submit").textContent = isSignup ? "Create account" : "Log in";
}

// --- Render functions ---

function renderStats() {
  const { mismatches, answerCount, onboarding, requests, rumbles, blockedUsers } = state;
  $("stat-mismatches").textContent = mismatches.length;
  $("stat-answers").textContent = answerCount;
  $("stat-onboarding").textContent = onboarding
    ? `${onboarding.answeredCount}/${onboarding.requiredCount}`
    : "0/10";
  $("stat-requests").textContent = requests.length;
  $("stat-rumbles").textContent = rumbles.length;
  $("stat-blocked").textContent = blockedUsers.length;
}

function renderStatement() {
  const { statement, onboarding } = state;

  $("response-form").hidden = !statement;
  $("btn-skip-statement").hidden = Boolean(onboarding && !onboarding.completed);

  const progress = $("onboarding-progress");
  if (onboarding) {
    progress.textContent = onboarding.completed
      ? "Keep responding to more statements to increase mismatch accuracy."
      : `Responded to ${onboarding.answeredCount} of ${onboarding.requiredCount} onboarding statements`;
    progress.hidden = false;
  } else {
    progress.hidden = true;
  }

  if (statement) {
    $("statement-text").textContent = `"${statement.content || "Statement unavailable"}"`;
    $("btn-submit-response").disabled = state.loading;
  }
}

function parseThreatLevels(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSharedThreatLevels(mismatch) {
  const user1Levels = parseThreatLevels(mismatch.user1_threat_levels);
  const user2Levels = parseThreatLevels(mismatch.user2_threat_levels);

  return ["green", "orange", "red"].filter(
    (level) => user1Levels.includes(level) && user2Levels.includes(level)
  );
}

function renderMismatches() {
  const { mismatches, onboarding } = state;
  const activeUserId = state.session?.user?.id;
  const list = $("mismatches-list");

  if (!mismatches.length) {
    const onboardingCompleted = Boolean(onboarding?.completed);
    list.innerHTML = onboardingCompleted
      ? '<p class="empty">Onboarding is complete. Create or log in as another user and answer the same statements differently, then refresh matches.</p>'
      : '<p class="empty">No mismatches yet.</p>';
    return;
  }

  const mismatchesWithSharedLevels = [...mismatches]
    .map((mismatch) => ({
      mismatch,
      sharedThreatLevels: getSharedThreatLevels(mismatch),
    }))
    .filter(({ sharedThreatLevels }) => sharedThreatLevels.length);

  if (!mismatchesWithSharedLevels.length) {
    list.innerHTML =
      '<p class="empty">No mismatches share any of your threat levels.</p>';
    return;
  }

  const topMismatches = mismatchesWithSharedLevels
    .sort((a, b) => (b.mismatch.mismatch_score ?? 0) - (a.mismatch.mismatch_score ?? 0))
    .slice(0, 5);

  list.innerHTML = topMismatches
    .map(({ mismatch, sharedThreatLevels }) => {
      const otherUserId = getOtherUserId(mismatch, activeUserId);
      const otherUsername =
        mismatch.user1_id === activeUserId ? mismatch.user2_username : mismatch.user1_username;

      const availableThreatLevels = sharedThreatLevels;

      const key = mismatch.id || `${mismatch.user1_id}-${mismatch.user2_id}`;
      const storedSelection = state.threatLevelSelections[key];
      const selectedThreatLevel = availableThreatLevels.includes(storedSelection)
        ? storedSelection
        : availableThreatLevels[0];

      const scoreValue = mismatch.mismatch_score ?? 0;
      const scoreClass = scoreValue > 74 ? "danger" : scoreValue > 50 ? "warning" : "success";

      return `
        <article class="row" data-mismatch-key="${key}">
          <div>
            <strong>${escapeHtml(otherUsername || otherUserId)}</strong>
            <p>${escapeHtml(mismatch.confidence || "unknown")} confidence - ${mismatch.shared_responses || 0} shared answers</p>
          </div>
          <div class="actions">
            <span class="score ${scoreClass}">${scoreValue}%</span>
            <select data-threat-select="${key}" class="threat-${selectedThreatLevel}">
              ${availableThreatLevels
                .map(
                  (level) =>
                    `<option value="${level}" class="threat-${level}" ${level === selectedThreatLevel ? "selected" : ""}>${level.charAt(0).toUpperCase() + level.slice(1)}</option>`
                )
                .join("")}
            </select>
            <button data-start-request="${key}" data-user-id="${otherUserId}" ${state.loading ? "disabled" : ""}>Challenge</button>
            <button class="ghost danger" data-block-user="${otherUserId}" ${state.loading ? "disabled" : ""}>Block</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRequests() {
  const { requests } = state;
  const activeUser = state.session?.user;
  const list = $("requests-list");
  const pending = requests.filter((r) => r.status === "pending");

  if (!pending.length) {
    list.innerHTML = '<p class="empty">No pending requests.</p>';
    return;
  }

  list.innerHTML = pending
    .map((request) => {
      const view = getRequestView(request, activeUser);
      return `
        <article class="mini-row request-card">
          <div>
            <strong>${escapeHtml(view.otherName)}</strong>
            <span>${view.direction} - ${escapeHtml(request.threat_level)}</span>
          </div>
          ${
            view.incoming
              ? `<div class="actions">
                  <button data-accept-request="${request.id}" ${state.loading ? "disabled" : ""}>Accept</button>
                  <button class="ghost" data-decline-request="${request.id}" ${state.loading ? "disabled" : ""}>Decline</button>
                </div>`
              : ""
          }
          ${view.outgoing ? '<span class="pill">Awaiting reply</span>' : ""}
        </article>
      `;
    })
    .join("");
}

function renderBlockedUsers() {
  const { blockedUsers } = state;
  const panel = $("blocked-users-panel");

  if (!blockedUsers.length) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;
  $("blocked-list").innerHTML = blockedUsers
    .map(
      (user) => `
        <article class="mini-row">
          <div><strong>${escapeHtml(user.username)}</strong></div>
          <button class="ghost" data-unblock-user="${user.id}" ${state.loading ? "disabled" : ""}>Unblock</button>
        </article>
      `
    )
    .join("");
}

function renderRumbles() {
  const activeRumble = getActiveRumble();
  const activeUserId = state.session?.user?.id;
  const select = $("rumble-select");

  select.innerHTML = state.rumbles.length
    ? state.rumbles
        .map((rumble) => {
          const opponentLabel =
            rumble.requester_id === activeUserId
              ? rumble.receiver_username || rumble.receiver_id
              : rumble.requester_username || rumble.requester_id;
          return `<option value="${rumble.id}" class="threat-${rumble.threat_level}" ${rumble.id === (activeRumble?.id || "") ? "selected" : ""}>vs. ${escapeHtml(opponentLabel)} · ${escapeHtml(rumble.threat_level)}</option>`;
        })
        .join("")
    : '<option value="">No active rumble</option>';

  const activeThreatLevel = activeRumble?.threat_level || "green";
  $("rumble-opponent").textContent = getOpponentName(activeRumble);
  $("rumble-threat").textContent = activeThreatLevel.toUpperCase();
  $("rumble-threat").className = `threat-${activeThreatLevel}`;
  $("rumble-status").textContent = activeRumble?.status.toUpperCase() || "INACTIVE";
  $("btn-terminate-rumble").disabled = state.loading || !activeRumble;
  $("btn-send-message").disabled = state.loading || !activeRumble;
}

function renderMessages() {
  const { messages } = state;
  const activeUserId = state.session?.user?.id;
  const activeRumble = getActiveRumble();
  const opponentName = getOpponentName(activeRumble);
  const chat = $("chat-messages");

  if (!messages.length) {
    chat.innerHTML = `
      <div class="chat-empty">
        <strong>${activeRumble ? "Your rumble has begun!" : "Waiting for an active rumble"}</strong>
        <p>${
          activeRumble
            ? "Send them a message when you're ready."
            : "You have no active rumbles, send someone a request or accept an incoming request."
        }</p>
      </div>
    `;
    return;
  }

  chat.innerHTML = messages
    .map(
      (msg) => `
        <div class="message ${msg.sender_id === activeUserId ? "mine" : ""}">
          <span>${msg.sender_id === activeUserId ? "You" : escapeHtml(opponentName)}</span>
          <p>${escapeHtml(msg.content)}</p>
        </div>
      `
    )
    .join("");

  chat.scrollTop = chat.scrollHeight;
}

function renderDashboard() {
  renderStats();
  renderStatement();
  renderMismatches();
  renderRequests();
  renderBlockedUsers();
  renderRumbles();
  renderMessages();
}

// --- Data loading ---

async function loadDashboard(showErrors = true) {
  const token = state.session?.accessToken;
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
      apiFetch("/statements", {}, token).catch((err) => {
        if (showErrors) showStatus(err.message, "warn");
        return null;
      }),
      apiFetch("/mismatches", {}, token).catch(() => []),
      apiFetch("/mismatches/requests", {}, token).catch(() => ({ data: [] })),
      apiFetch("/rumbles", {}, token).catch(() => ({ data: [] })),
      apiFetch("/user/blocks", {}, token).catch(() => ({ data: [] })),
      apiFetch("/user/onboarding", {}, token).catch(() => null),
      apiFetch("/statements/responses", {}, token).catch(() => []),
    ]);

    state.statement = nextStatement || null;
    state.mismatches = asArray(nextMismatches);
    state.requests = asArray(nextRequests);
    const loadedRumbles = asArray(nextRumbles);
    state.rumbles = loadedRumbles;
    if (!state.selectedRumbleId) state.selectedRumbleId = loadedRumbles[0]?.id || "";
    state.blockedUsers = asArray(nextBlockedUsers);
    state.onboarding = nextOnboarding;
    state.answerCount = nextResponses?.pagination?.total ?? asArray(nextResponses).length;
  } finally {
    setLoading(false);
    renderDashboard();
  }
}

async function loadMessages() {
  const token = state.session?.accessToken;
  const activeRumble = getActiveRumble();

  if (!token || !state.showDashboard || !activeRumble?.id) {
    state.messages = [];
    renderMessages();
    return;
  }

  const next = await apiFetch(
    `/rumbles/${activeRumble.id}/messages?page=1&limit=20`,
    {},
    token
  ).catch(() => ({ data: [] }));
  state.messages = asArray(next);
  renderMessages();
}

// --- Socket ---

function connectSocket() {
  disconnectSocket();

  const token = state.session?.accessToken;
  const activeRumble = getActiveRumble();
  if (!token || !state.showDashboard || !activeRumble?.id) return;

  // io is loaded from the socket.io CDN script
  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socket.emit("rumble:join", { rumbleId: activeRumble.id });

  socket.on("rumble:message", (event) => {
    const msg = event?.data || event;
    if (!msg?.id) return;
    if (!state.messages.some((m) => m.id === msg.id)) {
      state.messages = [...state.messages, msg];
      renderMessages();
    }
  });

  socket.on("connect_error", (err) => {
    showStatus(`Live rumble disconnected: ${err.message}`, "warn");
  });

  state.socket = socket;
}

function disconnectSocket() {
  if (!state.socket) return;
  const activeRumble = getActiveRumble();
  if (activeRumble?.id) state.socket.emit("rumble:leave", { rumbleId: activeRumble.id });
  state.socket.disconnect();
  state.socket = null;
}

// --- Actions ---

async function submitAuth(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const isSignup = state.authMode === "signup";

    const threatLevels = [...$("field-threat-levels").querySelectorAll("input:checked")].map(
      (input) => input.value
    );

    if (isSignup && !threatLevels.length) {
      showStatus("Select at least one threat level.", "error");
      return;
    }

    const body = isSignup
      ? {
          username: $("input-username").value,
          email: $("input-email").value,
          password: $("input-password").value,
          bio: $("input-bio").value,
          threat_levels: threatLevels,
        }
      : {
          identifier: $("input-identifier").value,
          password: $("input-password").value,
        };

    const nextSession = await apiFetch(`/auth/${state.authMode}`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    state.session = nextSession;
    saveSession(nextSession);
    state.showDashboard = true;
    updateView();
    await loadDashboard();
    await loadMessages();
    connectSocket();
    showStatus(`Signed in as ${nextSession.user?.username || "Rumblr user"}.`, "success");
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

function logout() {
  disconnectSocket();
  state.session = null;
  saveSession(null);
  state.statement = null;
  state.mismatches = [];
  state.requests = [];
  state.rumbles = [];
  state.messages = [];
  state.selectedRumbleId = "";
  state.showDashboard = false;
  updateView();
  showStatus("Signed out.", "info");
}

async function saveResponse(e) {
  e.preventDefault();
  setLoading(true);

  try {
    await apiFetch(
      `/statements/${state.statement.id}/respond`,
      {
        method: "POST",
        body: JSON.stringify({
          agreement_score: Number(state.agreementScore),
          importance_score: Number(state.importanceScore),
        }),
      },
      state.session.accessToken
    );

    await loadDashboard(false);
    state.agreementScore = 3;
    state.importanceScore = 3;
    document.querySelector('input[name="agreement_score"][value="3"]').checked = true;
    $("importance-score").value = 3;
    $("importance-display").textContent = "3/5";
    showStatus("Response saved.", "success");
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function createRequest(userId, threatLevel) {
  setLoading(true);
  try {
    await apiFetch(
      `/mismatches/${userId}`,
      { method: "POST", body: JSON.stringify({ threat_level: threatLevel }) },
      state.session.accessToken
    );
    showStatus("Rumble request sent.", "success");
    await loadDashboard(false);
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function updateRequest(requestId, action) {
  setLoading(true);
  try {
    await apiFetch(
      `/mismatches/${requestId}/${action}`,
      { method: "POST" },
      state.session.accessToken
    );
    showStatus(`Request ${action === "accept" ? "accepted" : "declined"}.`, "success");
    await loadDashboard(false);
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function sendMessage(e) {
  e.preventDefault();
  const content = $("message-input").value.trim();
  const activeRumble = getActiveRumble();
  if (!content || !activeRumble?.id) return;

  setLoading(true);
  try {
    await apiFetch(
      `/rumbles/${activeRumble.id}/messages`,
      { method: "POST", body: JSON.stringify({ content }) },
      state.session.accessToken
    );
    $("message-input").value = "";
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function terminateRumble() {
  const activeRumble = getActiveRumble();
  if (!activeRumble?.id) return;

  setLoading(true);
  try {
    await apiFetch(
      `/rumbles/${activeRumble.id}/terminate`,
      { method: "PUT" },
      state.session.accessToken
    );
    showStatus("Rumble terminated.", "success");
    await loadDashboard(false);
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function blockUser(userId) {
  if (!userId) return;
  setLoading(true);
  try {
    await apiFetch(`/user/blocks/${userId}`, { method: "POST" }, state.session.accessToken);
    showStatus("User blocked.", "success");
    await loadDashboard(false);
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

async function unblockUser(userId) {
  if (!userId) return;
  setLoading(true);
  try {
    await apiFetch(`/user/blocks/${userId}`, { method: "DELETE" }, state.session.accessToken);
    showStatus("User unblocked.", "success");
    await loadDashboard(false);
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    setLoading(false);
  }
}

// --- Event wiring ---

function init() {
  updateView();

  // Auth tabs
  $("btn-login-tab").addEventListener("click", () => setAuthMode("login"));
  $("btn-signup-tab").addEventListener("click", () => setAuthMode("signup"));

  // Auth form submit
  $("auth-form").addEventListener("submit", submitAuth);

  // Show/hide password
  $("btn-show-password").addEventListener("click", () => {
    state.showPassword = !state.showPassword;
    $("input-password").type = state.showPassword ? "text" : "password";
    $("btn-show-password").textContent = state.showPassword ? "Hide" : "Show";
  });

  // Resume / logout
  $("btn-continue").addEventListener("click", async () => {
    state.showDashboard = true;
    updateView();
    await loadDashboard();
    await loadMessages();
    connectSocket();
  });
  $("btn-logout").addEventListener("click", logout);
  $("btn-logout-resume").addEventListener("click", logout);

  // Skip statement
  $("btn-skip-statement").addEventListener("click", () => loadDashboard(false));

  // Response form
  $("response-form").addEventListener("submit", saveResponse);
  document.querySelectorAll('input[name="agreement_score"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.agreementScore = Number(e.target.value);
    });
  });
  $("importance-score").addEventListener("input", (e) => {
    state.importanceScore = e.target.value;
    $("importance-display").textContent = `${e.target.value}/5`;
  });

  // Mismatches — event delegation for clicks and threat-level selects
  $("mismatches-list").addEventListener("click", (e) => {
    if (state.loading) return;

    const startBtn = e.target.closest("[data-start-request]");
    if (startBtn) {
      const key = startBtn.dataset.startRequest;
      const userId = startBtn.dataset.userId;
      const sel = $("mismatches-list").querySelector(`[data-threat-select="${key}"]`);
      createRequest(userId, sel?.value || "green");
      return;
    }

    const blockBtn = e.target.closest("[data-block-user]");
    if (blockBtn) {
      blockUser(blockBtn.dataset.blockUser);
    }
  });

  $("mismatches-list").addEventListener("change", (e) => {
    const sel = e.target.closest("[data-threat-select]");
    if (sel) {
      state.threatLevelSelections[sel.dataset.threatSelect] = sel.value;
      sel.className = `threat-${sel.value}`;
    }
  });

  // Requests — event delegation
  $("requests-list").addEventListener("click", (e) => {
    if (state.loading) return;

    const acceptBtn = e.target.closest("[data-accept-request]");
    if (acceptBtn) {
      updateRequest(acceptBtn.dataset.acceptRequest, "accept");
      return;
    }

    const declineBtn = e.target.closest("[data-decline-request]");
    if (declineBtn) {
      updateRequest(declineBtn.dataset.declineRequest, "decline");
    }
  });

  $("btn-refresh-requests").addEventListener("click", () => loadDashboard(false));

  // Blocked users — event delegation
  $("blocked-list").addEventListener("click", (e) => {
    if (state.loading) return;
    const btn = e.target.closest("[data-unblock-user]");
    if (btn) unblockUser(btn.dataset.unblockUser);
  });

  // Rumble select
  $("rumble-select").addEventListener("change", async (e) => {
    const prev = state.selectedRumbleId;
    state.selectedRumbleId = e.target.value;
    if (prev !== state.selectedRumbleId) {
      disconnectSocket();
      await loadMessages();
      connectSocket();
      renderRumbles();
    }
  });

  $("btn-terminate-rumble").addEventListener("click", terminateRumble);

  // Message form
  $("message-form").addEventListener("submit", sendMessage);
}

document.addEventListener("DOMContentLoaded", init);
