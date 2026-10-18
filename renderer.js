const $ = (id) => document.getElementById(id);
const messagesEl = $("messages");
const input = $("messageInput");
const sendButton = $("sendButton");
const welcome = $("welcome");
const toast = $("toast");
let history = [];
let busy = false;
let toastTimer;
let recognition = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function addMessage(role, text, id) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  if (id) row.id = id;
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? "FA" : "F✦";
  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = text;
  row.append(avatar, body);
  messagesEl.appendChild(row);
  $("conversation").scrollTop = $("conversation").scrollHeight;
  return body;
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  sendButton.textContent = value ? "…" : "↑";
}

async function sendMessage(text) {
  const message = (text || input.value).trim();
  if (!message || busy) return;
  welcome.hidden = true;
  input.value = "";
  input.style.height = "auto";
  addMessage("user", message);
  history.push({ role: "user", content: message });
  setBusy(true);
  const replyEl = addMessage("assistant", "Thinking…", "pendingReply");
  replyEl.classList.add("typing");
  try {
    let result;
    if (window.farhanAI?.chat) {
      result = await window.farhanAI.chat(history);
    } else {
      result = await webChat(history);
    }
    replyEl.textContent = result.text || "I couldn't generate a reply.";
    replyEl.classList.remove("typing");
    history.push({ role: "assistant", content: replyEl.textContent });
    speakIfEnabled(replyEl.textContent);
  } catch (error) {
    replyEl.textContent = `I couldn't reach the AI provider. ${error.message || "Check your provider configuration and try again."}`;
    replyEl.classList.remove("typing");
  } finally {
    setBusy(false);
    input.focus();
    $("conversation").scrollTop = $("conversation").scrollHeight;
  }
}

// Browser/Vercel preview uses the same-origin serverless API. API keys stay server-side.
async function webChat(messages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.slice(-20) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Configure GROQ_API_KEY or OPENROUTER_API_KEY in Vercel project settings.");
  return data;
}

function speakIfEnabled(text) {
  if (!window.speechSynthesis || !document.body.classList.contains("voice-replies")) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

sendButton.addEventListener("click", () => sendMessage());
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
});
$("newChat").addEventListener("click", () => {
  history = [];
  messagesEl.replaceChildren();
  welcome.hidden = false;
  input.value = "";
  showToast("New conversation started.");
});
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
$("folderButton").addEventListener("click", async () => {
  if (!window.farhanAI?.chooseFolder) {
    showToast("Workspace folder selection is available in the Windows desktop app.");
    return;
  }
  try {
    const result = await window.farhanAI.chooseFolder();
    if (!result.canceled) showToast("Workspace selected: " + result.path);
  } catch (error) { showToast(error.message); }
});
$("providerInfo").addEventListener("click", () => showToast("Set GROQ_API_KEY or OPENROUTER_API_KEY in your environment (desktop) or Vercel project environment variables (web preview). Never put keys in renderer.js."));
$("themeHint").addEventListener("click", () => showToast("Farhan AI is running in its dark workspace."));
$("voiceButton").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Voice recognition isn't supported in this browser. Try current Chrome or Edge.");
    return;
  }
  if (recognition) { recognition.stop(); return; }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  const button = $("voiceButton");
  button.classList.add("listening");
  $("voiceLabel").textContent = "Listening…";
  let finalText = "";
  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    input.value = finalText || interim;
  };
  recognition.onerror = () => showToast("Microphone input stopped. Check your browser microphone permission.");
  recognition.onend = () => {
    button.classList.remove("listening");
    $("voiceLabel").textContent = "Voice input";
    recognition = null;
    if (finalText.trim()) sendMessage(finalText.trim());
  };
  recognition.start();
});

(async function init() {
  if (window.farhanAI?.getStatus) {
    try {
      const status = await window.farhanAI.getStatus();
      $("providerTitle").textContent = "Desktop app ready";
      $("providerText").textContent = status.platform + " • AI key needed";
    } catch {}
  } else {
    $("providerTitle").textContent = "Web preview";
    $("providerText").textContent = "Configure AI provider";
  }
})();
