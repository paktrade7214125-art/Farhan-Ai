const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("node:path");

const ALLOWED_SITES = new Set([
  "https://www.google.com",
  "https://www.youtube.com",
  "https://github.com",
  "https://vercel.com",
  "https://chatgpt.com"
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#080b12",
    title: "Farhan AI",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("farhan:status", async () => ({
  appName: "Farhan AI",
  platform: process.platform,
  version: app.getVersion(),
  mode: "desktop"
}));

ipcMain.handle("farhan:open-site", async (_event, rawUrl) => {
  if (typeof rawUrl !== "string") throw new Error("Invalid website request.");
  let url;
  try { url = new URL(rawUrl); } catch { throw new Error("That website address is invalid."); }
  if (url.protocol !== "https:" || !ALLOWED_SITES.has(url.origin)) {
    throw new Error("For safety, this website is not on Farhan AI's approved list.");
  }
  await shell.openExternal(url.toString());
  return { ok: true };
});

ipcMain.handle("farhan:choose-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  return { canceled: false, path: result.filePaths[0] };
});

ipcMain.handle("farhan:chat", async (_event, messages) => {
  if (!Array.isArray(messages) || messages.length > 30) throw new Error("Invalid chat history.");
  const safeMessages = messages.slice(-20).map((m) => {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") {
      throw new Error("Invalid message format.");
    }
    return { role: m.role, content: m.content.slice(0, 6000) };
  });
  const system = {
    role: "system",
    content: "You are Farhan AI, a helpful voice-first personal assistant. Be concise and clear. You cannot directly control the computer unless an explicit safe tool is available. Never claim you performed an action you did not perform. Ask before consequential actions."
  };

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!openRouterKey && !groqKey) {
    return { text: "I’m ready, but no AI provider key is configured yet. Set OPENROUTER_API_KEY or GROQ_API_KEY in your environment, then restart Farhan AI." };
  }

  const endpoint = openRouterKey
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.groq.com/openai/v1/chat/completions";
  const key = openRouterKey || groqKey;
  const model = openRouterKey
    ? (process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini")
    : (process.env.GROQ_MODEL || "llama-3.3-70b-versatile");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(openRouterKey ? { "HTTP-Referer": "https://farhan-ai.vercel.app", "X-Title": "Farhan AI" } : {})
    },
    body: JSON.stringify({ model, messages: [system, ...safeMessages], temperature: 0.6 })
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`AI provider error (${response.status}): ${detail}`);
  }
  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content || "I couldn't generate a reply this time." };
});
