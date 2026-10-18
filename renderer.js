const $ = (id) => document.getElementById(id);
const messagesEl = $("messages"), input = $("messageInput"), sendButton = $("sendButton"), welcome = $("welcome"), toast = $("toast");
let history = [], busy = false, toastTimer, recognition = null, workspacePath = null, stopRequested = false;
const storage = { get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }, set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} } };

function showToast(message) {
  toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
}
function setStatus(state) {
  const label = $("assistantStatus"); if (label) label.textContent = state;
  document.body.dataset.state = state.toLowerCase();
}
function addMessage(role, text, id) {
  const row = document.createElement("div"); row.className = `message ${role}`; if (id) row.id = id;
  const avatar = document.createElement("div"); avatar.className = "message-avatar"; avatar.textContent = role === "user" ? "FA" : "F✦";
  const body = document.createElement("div"); body.className = "message-body"; body.textContent = text;
  row.append(avatar, body); messagesEl.appendChild(row); $("conversation").scrollTop = $("conversation").scrollHeight; return body;
}
function setBusy(value) {
  busy = value; sendButton.disabled = value; sendButton.textContent = value ? "…" : "↑";
  if ($("stopButton")) $("stopButton").hidden = !value;
  setStatus(value ? "Thinking" : "Idle");
}
function speakIfEnabled(text) {
  if (!window.speechSynthesis || !storage.get("farhanVoiceReplies", true)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = storage.get("farhanLanguage", "pa-PK");
  utterance.lang = lang; utterance.rate = 0.96;
  utterance.onstart = () => setStatus("Speaking"); utterance.onend = () => setStatus("Idle");
  window.speechSynthesis.speak(utterance);
}
async function localCommand(raw) {
  if (!window.farhanAI) return null;
  const text = raw.trim().toLowerCase().replace(/[.!?،۔]+$/g, "");

  const search = /^(?:google\s+)?search(?:\s+google)?\s+for\s+(.+)$/i.exec(text) ||
    /^(?:search|تلاش کرو|گوگل پر تلاش کرو)\s+(.+)$/i.exec(text);
  if (search) {
    const url = "https://www.google.com/search?q=" + encodeURIComponent(search[1]);
    await window.farhanAI.openSite(url);
    return `Theek ae bai, Google te “${search[1]}” search kar ditta.`;
  }

  const open = /^(?:please\s+)?(?:open|launch|kholo|khol do|khol de|chalao|chala de|چلاؤ|کھولو)\s+(.+)$/i.exec(text);
  if (open) {
    const targetText = open[1].trim();
    const targets = [
      [/^(?:youtube|یوٹیوب)(?:\s+.*)?$/, "youtube", "YouTube"],
      [/^(?:whatsapp|واٹس ?ایپ)(?:\s+.*)?$/, "whatsapp", "WhatsApp Web"],
      [/^(?:chrome|google chrome|browser|براوزر|کروم)$/, "chrome", "Google in your default browser"],
      [/^(?:google|گوگل)$/, "google", "Google"],
      [/^(?:github|گٹ ہب)$/, "github", "GitHub"],
      [/^(?:downloads|download folder|my downloads|my downloads folder|ڈاؤن لوڈز|ڈاؤن لوڈ فولڈر)$/, "downloads", "Downloads folder"]
    ];
    for (const [pattern, key, label] of targets) {
      if (pattern.test(targetText)) {
        const result = await window.farhanAI.openKnown(key);
        return `Theek ae bai — ${label} khol ditta. ${result.detail || ""}`.trim();
      }
    }
  }

  const searchMatch = /^(?:find|search for|labh|labho|dhoondo|دھوڈو|تلاش کرو)\s+(?:my\s+)?(.+)$/i.exec(text);
  if (searchMatch && /\b(pdf|html|file|files|project|document|documents|پی ڈی ایف|فائل)\b/i.test(searchMatch[1])) {
    const query = /\bpdf\b|پی ڈی ایف/i.test(searchMatch[1]) ? ".pdf" :
      /\bhtml\b/i.test(searchMatch[1]) ? ".html" :
      searchMatch[1].replace(/\b(my|file|files|project|document|documents)\b/gi, "").trim();
    const result = await window.farhanAI.searchFiles(query || ".");
    if (!result.matches.length) return "Bai, selected workspace vich koi matching file nahi labhi. Workspace select karke dubara try karo.";
    const listed = result.matches.map((file, i) => `${i + 1}. ${file.name} — ${file.path}`).join("\n");
    return `Eh files labhiyan ne:\n${listed}\n\nKise file nu kholan layi usda exact path chat vich paste karo. File search selected workspace tak mehdood ae.`;
  }

  const folderMatch = /^(?:create|make|bnao|bana do|بنا دو)\s+(?:a\s+)?folder\s+(?:named\s+|called\s+)?(.+)$/i.exec(text) ||
    /^(?:folder bnao|folder bana do)\s+(.+)$/i.exec(text);
  if (folderMatch) {
    const result = await window.farhanAI.createFolder(folderMatch[1].replace(/^["']|["']$/g, "").trim());
    return `Done bai, folder create ho gaya: ${result.path}`;
  }

  const fileOpen = /^(?:open|kholo|کھولو)\s+(?:this\s+)?file\s+(.+)$/i.exec(text);
  if (fileOpen) {
    const filePath = fileOpen[1].trim().replace(/^["']|["']$/g, "");
    const result = await window.farhanAI.openWorkspaceFile(filePath);
    return `File open ho gayi: ${result.path}`;
  }
  return null;
}
async function sendMessage(text) {
  const message = (text || input.value).trim(); if (!message || busy) return;
  welcome.hidden = true; input.value = ""; input.style.height = "auto";
  addMessage("user", message); history.push({ role: "user", content: message }); storage.set("farhanHistory", history);
  setBusy(true); stopRequested = false;
  const replyEl = addMessage("assistant", "Soch reha aan bai…", "pendingReply"); replyEl.classList.add("typing");
  try {
    let result;
    try { result = await localCommand(message); } catch (error) { throw error; }
    if (stopRequested) { replyEl.textContent = "Task stopped."; return; }
    if (result !== null) result = { text: result };
    else if (window.farhanAI?.chat) result = await window.farhanAI.chat(history);
    else result = await webChat(history);
    if (stopRequested) { replyEl.textContent = "Task stopped."; return; }
    replyEl.textContent = result.text || "Maaf bai, jawab nahi ban sakya.";
    history.push({ role: "assistant", content: replyEl.textContent }); storage.set("farhanHistory", history);
    replyEl.classList.remove("typing"); speakIfEnabled(replyEl.textContent);
  } catch (error) {
    replyEl.textContent = `Maaf bai, command complete nahi hoyi: ${error.message || "Unknown error"}`;
    replyEl.classList.remove("typing"); showToast(error.message || "Command failed.");
  } finally { setBusy(false); input.focus(); $("conversation").scrollTop = $("conversation").scrollHeight; }
}
async function webChat(messages) {
  const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: messages.slice(-20) }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Set GROQ_API_KEY or OPENROUTER_API_KEY in Vercel settings.");
  return data;
}
sendButton.addEventListener("click", () => sendMessage());
input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } });
input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; });
$("newChat").addEventListener("click", () => {
  history = []; storage.set("farhanHistory", history); messagesEl.replaceChildren(); welcome.hidden = false; input.value = ""; showToast("Navi gall-baat shuru ho gayi bai.");
});
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => sendMessage(button.dataset.prompt)));
$("folderButton").addEventListener("click", async () => {
  if (!window.farhanAI?.chooseFolder) return showToast("Workspace selection desktop app vich available ae.");
  try { const result = await window.farhanAI.chooseFolder(); if (!result.canceled) { workspacePath = result.path; $("workspaceText").textContent = result.path; showToast("Workspace save ho gaya."); } }
  catch (error) { showToast(error.message); }
});
$("providerInfo").addEventListener("click", () => showToast("AI chat layi GROQ_API_KEY ya OPENROUTER_API_KEY environment variable vich set karo. Local commands key ton bina vi chal sakdiyan ne."));
$("themeHint").addEventListener("click", () => $("settingsDrawer").hidden = !$("settingsDrawer").hidden);\n$("closeSettings").addEventListener("click", () => $("settingsDrawer").hidden = true);
$("voiceReplies").addEventListener("change", event => storage.set("farhanVoiceReplies", event.target.checked));
$("languageSelect").addEventListener("change", event => storage.set("farhanLanguage", event.target.value));
$("stopButton").addEventListener("click", () => {
  stopRequested = true;
  if (recognition) { recognition.stop(); recognition = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  setStatus("Idle"); showToast("Speech stopped. A running network request may finish in the background.");
});
$("voiceButton").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return showToast("Voice recognition is not supported here. Try current Chrome or Edge; typed commands still work.");
  if (recognition) { recognition.stop(); return; }
  recognition = new SpeechRecognition();
  recognition.lang = storage.get("farhanLanguage", "pa-PK"); recognition.interimResults = true; recognition.continuous = false;
  const button = $("voiceButton"); button.classList.add("listening"); $("voiceLabel").textContent = "Sun reha aan…"; setStatus("Listening");
  let finalText = "";
  recognition.onresult = event => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalText += event.results[i][0].transcript; else interim += event.results[i][0].transcript;
    }
    input.value = finalText || interim;
  };
  recognition.onerror = event => showToast(`Mic error: ${event.error}. Check microphone permission or use text.`);
  recognition.onend = () => {
    button.classList.remove("listening"); $("voiceLabel").textContent = "Voice command"; recognition = null;
    if (finalText.trim()) sendMessage(finalText.trim()); else setStatus("Idle");
  };
  try { recognition.start(); } catch (error) { recognition = null; button.classList.remove("listening"); showToast(error.message); setStatus("Idle"); }
});
(async function init() {
  history = storage.get("farhanHistory", []);
  for (const item of history.slice(-40)) addMessage(item.role, item.content);
  if (history.length) welcome.hidden = true;
  $("voiceReplies").checked = storage.get("farhanVoiceReplies", true);
  $("languageSelect").value = storage.get("farhanLanguage", "pa-PK");
  if (window.farhanAI?.getStatus) {
    try {
      const status = await window.farhanAI.getStatus();
      $("providerTitle").textContent = "Desktop app ready";
      $("providerText").textContent = status.platform + (status.workspacePath ? " • workspace ready" : " • choose workspace");
      if (status.workspacePath) { workspacePath = status.workspacePath; $("workspaceText").textContent = status.workspacePath; }
    } catch {}
  } else { $("providerTitle").textContent = "Web preview"; $("providerText").textContent = "Local control unavailable"; }
})();
