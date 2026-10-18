# Farhan AI

Farhan AI is a Windows-first desktop companion with a Punjabi-first voice/text interface, an animated original cat mascot, and a small set of real, safety-scoped local actions.

## Current implementation
- Electron desktop window with context isolation, Node integration disabled, and a narrow preload bridge.
- Punjabi-first Roman Punjabi assistant prompt, with selectable Punjabi/Pakistan, Urdu/Pakistan, and English speech settings where browser speech support exists.
- Typed chat, browser speech recognition, optional spoken replies, stop-speaking/task feedback, saved local conversation history, and saved preferences.
- Supported local commands in the desktop app: open YouTube, WhatsApp Web, Google/default browser, GitHub, and Downloads; Google search; choose and persist a workspace; search files in that workspace; create a folder in that workspace; open a file by its full path inside that workspace.
- In-app Settings panel to choose Groq or OpenRouter, set a model override, securely save/remove an API key in the desktop app, and show the configured-key status. Groq and OpenRouter can be used independently.
- Web preview has no permission to control the local computer. The desktop app is required for local commands.

## AI provider settings

Open the gear icon in the app. Choose **Groq** or **OpenRouter**, optionally enter a model ID, paste the provider API key, and press **Save API settings**. In the desktop app, the key is encrypted with Electron safeStorage when the OS supports secure storage; the renderer never reads it back. Remove it with **Remove saved key**. If secure storage is unavailable, use an environment variable instead.

For the web preview, API keys must remain server-side in Vercel Project Settings → Environment Variables (`GROQ_API_KEY` or `OPENROUTER_API_KEY`); the browser settings UI cannot safely save provider secrets. The desktop app uses the selected provider and model. Default models are `llama-3.3-70b-versatile` for Groq and `openai/gpt-4o-mini` for OpenRouter.

## Run on Windows
1. Install a current Node.js LTS release.
2. Clone this repository and run `npm install`.
3. Optional, for AI conversation (basic local commands do not need a key), set one provider key in PowerShell:
   ```powershell
   $env:GROQ_API_KEY="your_key_here"
   npm start
   ```
   Or use `$env:OPENROUTER_API_KEY="your_key_here"`.
4. Click **Choose workspace** before using file search or folder creation.

## Example commands
- `Open YouTube`
- `Open WhatsApp`
- `Open my Downloads folder`
- `Search Google for React tutorials`
- `Find my PDF files`
- `Create folder named Projects`

Commands can be typed even when speech recognition is unavailable. Voice recognition is provided by the browser's SpeechRecognition API; support and language availability vary by browser/OS and may require an internet connection. Text-to-speech uses the system/browser speech synthesis voices available on the machine.

## Safety boundaries and known limitations
- Website destinations are allowlisted and opened with the operating system's default browser. “Open Chrome” currently opens Google in the default browser; it does not guarantee launching the Chrome executable.
- File search, folder creation, and file opening are restricted to the selected workspace. File search skips hidden folders and node_modules and is bounded to depth 8 / 12,000 entries / 25 matches.
- No arbitrary shell execution, background listening/wake word, automatic deletion, overwrite, or unrestricted file writing is implemented.
- The stop button cancels speech and prevents pending responses from being applied, but cannot reliably cancel an already-started provider network request.
- This implementation has not been built or run on a Windows machine in this session. Test with `npm install`, `npm start`, and `npm run dist` on Windows before treating it as release-ready.

## AI provider keys
Set `GROQ_API_KEY` or `OPENROUTER_API_KEY` in the environment before starting the desktop app. For the Vercel web preview, set the corresponding server-side environment variable in project settings and redeploy. Never place provider keys in client-side JavaScript or committed files.
