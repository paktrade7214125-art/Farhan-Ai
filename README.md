# Farhan AI

Farhan AI is a Windows-first, voice-friendly personal assistant. This repository now contains an initial runnable Electron desktop scaffold and a web preview for the interface.

> **Current status:** Initial implementation added: Electron window, secure preload bridge, typed AI chat via Groq/OpenRouter, browser speech input where supported, a workspace folder picker, and a Vercel serverless chat endpoint. This is an early foundation, not yet a full Jarvis-style computer-control agent. General shell execution, arbitrary file edits, app control, persistent chat history, and full voice-command automation are not implemented.

## Stack
- Electron + Node.js for the Windows desktop app.
- HTML, CSS, and vanilla JavaScript for the UI.
- Groq or OpenRouter for chat completion.
- Vercel serverless endpoint for the browser preview.

## Run the desktop app on Windows

1. Install a current Node.js LTS release.
2. Clone the repository and open a terminal in the repository folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set **one** provider key in your terminal before launching. For PowerShell:
   ```powershell
   $env:GROQ_API_KEY="your_key_here"
   npm start
   ```
   Or use OpenRouter:
   ```powershell
   $env:OPENROUTER_API_KEY="your_key_here"
   npm start
   ```

The key is read by the Electron main process; do not put it in `renderer.js`, HTML, or any committed file. Restart the app after setting environment variables. Provider usage may incur charges or rate limits.

## Vercel web preview

The root `index.html` serves the UI, and `api/chat.js` handles chat requests server-side. The browser preview does **not** have permission to control your Windows computer.

In Vercel Project Settings → Environment Variables, add either `GROQ_API_KEY` or `OPENROUTER_API_KEY` for Preview and Production, then redeploy. Never expose the provider key in a `NEXT_PUBLIC_*` variable or client-side JavaScript.

## Voice input

The microphone button uses the browser's SpeechRecognition API when supported. Browser and OS microphone permission is required. Speech recognition availability varies by browser; typed chat remains available.

## Safety boundaries

- Electron renderer runs with Node integration disabled and context isolation enabled.
- The preload exposes a small allowlisted API rather than raw Node or shell access.
- External website opening is limited to a small HTTPS allowlist.
- No arbitrary shell commands or model-generated code are executed.
- The folder picker currently selects a folder but file reading/writing tools are not yet implemented.

## Roadmap from here

1. Add automated tests and verify desktop startup/build.
2. Add user-approved workspace-scoped file tools with path validation.
3. Add explicit confirmation dialogs for any consequential local action.
4. Add settings UI for provider/model selection and secure local configuration.
5. Add local conversation persistence and speech output controls.
6. Add carefully scoped app/window automation only after permission and safety design.

## Project documents

- [Agent instructions](AGENTS.md)
- [Product requirements](PRD.md)
- [Architecture](ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Feature registry](docs/FEATURES.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](docs/SECURITY.md)
- [AI providers](docs/AI_PROVIDERS.md)
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Changelog](docs/CHANGELOG.md)
- [AI coding-agent custom instructions](docs/AI_CUSTOM_INSTRUCTIONS.md)
- [Feature request template](docs/templates/FEATURE_REQUEST.md)
- [Implementation prompt template](docs/templates/IMPLEMENT_FEATURE.md)
- [Architecture decisions](docs/decisions/README.md)
