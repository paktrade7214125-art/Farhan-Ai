const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

const ALLOWED_ORIGINS = new Set([
  "https://www.google.com", "https://youtube.com", "https://www.youtube.com",
  "https://web.whatsapp.com", "https://github.com", "https://vercel.com", "https://chatgpt.com"
]);
let workspacePath = null;

function isInsideWorkspace(candidate) {
  if (!workspacePath) return false;
  const relative = path.relative(workspacePath, path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
function safeName(value) {
  return typeof value === "string" && value.trim().length > 0 &&
    value.trim().length <= 80 && !/[<>:"\/\\|?*\x00-\x1f]/.test(value.trim()) &&
    !/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i.test(value.trim());
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1360, height: 900, minWidth: 760, minHeight: 600,
    backgroundColor: "#080b12", title: "Farhan AI",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.loadFile("index.html");
}
app.whenReady().then(async () => {
  try {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    const settings = JSON.parse(await fs.readFile(settingsPath, "utf8"));
    if (typeof settings.workspacePath === "string") {
      const stat = await fs.stat(settings.workspacePath);
      if (stat.isDirectory()) workspacePath = settings.workspacePath;
    }
  } catch {}
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

ipcMain.handle("farhan:status", () => ({
  appName: "Farhan AI", platform: process.platform, version: app.getVersion(),
  mode: "desktop", workspacePath
}));
ipcMain.handle("farhan:open-site", async (_event, rawUrl) => {
  if (typeof rawUrl !== "string") throw new Error("Invalid website request.");
  let url;
  try { url = new URL(rawUrl); } catch { throw new Error("That website address is invalid."); }
  if (url.protocol !== "https:" || !ALLOWED_ORIGINS.has(url.origin)) {
    throw new Error("For safety, this website is not on Farhan AI's approved list.");
  }
  await shell.openExternal(url.toString());
  return { ok: true };
});
ipcMain.handle("farhan:choose-folder", async () => {
  const result = await dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  workspacePath = path.resolve(result.filePaths[0]);
  const settingsPath = path.join(app.getPath("userData"), "settings.json");
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify({ workspacePath }, null, 2), "utf8");
  return { canceled: false, path: workspacePath };
});
ipcMain.handle("farhan:open-known", async (_event, target) => {
  const sites = {
    youtube: "https://www.youtube.com",
    whatsapp: "https://web.whatsapp.com",
    chrome: "https://www.google.com",
    google: "https://www.google.com",
    github: "https://github.com"
  };
  if (target === "downloads") {
    const downloads = app.getPath("downloads");
    const error = await shell.openPath(downloads);
    if (error) throw new Error(error);
    return { ok: true, detail: downloads };
  }
  const url = sites[target];
  if (!url) throw new Error("That app or website is not on the supported list yet.");
  await shell.openExternal(url);
  return { ok: true, detail: url };
});
ipcMain.handle("farhan:create-folder", async (_event, name) => {
  if (!workspacePath) throw new Error("Choose a workspace folder first.");
  if (!safeName(name)) throw new Error("Folder name is invalid. Use a simple name without symbols.");
  const destination = path.join(workspacePath, name.trim());
  if (!isInsideWorkspace(destination)) throw new Error("That folder path is outside the workspace.");
  try { await fs.mkdir(destination); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("A folder or file with that name already exists.");
    throw error;
  }
  return { ok: true, path: destination };
});
ipcMain.handle("farhan:search-files", async (_event, query) => {
  if (!workspacePath) throw new Error("Choose a workspace folder first.");
  if (typeof query !== "string" || !query.trim() || query.length > 120) throw new Error("Enter a file name or extension to search for.");
  const needle = query.trim().toLowerCase();
  const matches = [];
  let visited = 0;
  async function walk(dir, depth) {
    if (depth > 8 || matches.length >= 25 || visited >= 12000) return;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (matches.length >= 25 || visited >= 12000) break;
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      visited++;
      const fullPath = path.join(dir, entry.name);
      if (!isInsideWorkspace(fullPath)) continue;
      if (entry.isDirectory()) await walk(fullPath, depth + 1);
      else if (entry.name.toLowerCase().includes(needle) ||
        (needle.startsWith(".") && path.extname(entry.name).toLowerCase() === needle)) {
        matches.push({ name: entry.name, path: fullPath });
      }
    }
  }
  await walk(workspacePath, 0);
  return { matches, limited: visited >= 12000 };
});
ipcMain.handle("farhan:open-workspace-file", async (_event, rawPath) => {
  if (typeof rawPath !== "string" || !isInsideWorkspace(rawPath)) throw new Error("For safety, only files inside your selected workspace can be opened.");
  const realPath = await fs.realpath(rawPath);
  if (!isInsideWorkspace(realPath)) throw new Error("That file resolves outside your selected workspace.");
  const stat = await fs.stat(realPath);
  if (!stat.isFile()) throw new Error("That path is not a file.");
  const error = await shell.openPath(realPath);
  if (error) throw new Error(error);
  return { ok: true, path: realPath };
});
ipcMain.handle("farhan:chat", async (_event, messages) => {
  if (!Array.isArray(messages) || messages.length > 30) throw new Error("Invalid chat history.");
  const safeMessages = messages.slice(-20).map((m) => {
    if (!m || !["user", "assistant"].includes(m.role) || typeof m.content !== "string") throw new Error("Invalid message format.");
    return { role: m.role, content: m.content.slice(0, 6000) };
  });
  const system = { role: "system", content: "You are Farhan AI, a friendly Punjabi-first personal assistant. Default to natural Roman Punjabi, and understand Urdu and English. Be concise and casual. You can suggest supported local actions, but never claim you performed a computer action unless a tool result confirms it. Ask before consequential actions. You cannot run arbitrary shell commands." };
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!openRouterKey && !groqKey) return { text: "Haan bai, main ready aan! AI chat layi GROQ_API_KEY ya OPENROUTER_API_KEY set karo. Basic local commands bina AI key de vi chal sakdiyan ne." };
  const endpoint = openRouterKey ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
  const key = openRouterKey || groqKey;
  const model = openRouterKey ? (process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini") : (process.env.GROQ_MODEL || "llama-3.3-70b-versatile");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json",
      ...(openRouterKey ? { "HTTP-Referer": "https://farhan-ai.vercel.app", "X-Title": "Farhan AI" } : {}) },
    body: JSON.stringify({ model, messages: [system, ...safeMessages], temperature: 0.6 })
  });
  if (!response.ok) throw new Error(`AI provider error (${response.status}): ${(await response.text()).slice(0, 400)}`);
  const data = await response.json();
  return { text: data.choices?.[0]?.message?.content || "Maaf bai, main jawab generate nahi kar sakya." };
});
