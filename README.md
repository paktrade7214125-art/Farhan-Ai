# Farhan AI

Farhan AI is a planned Windows-first personal desktop assistant. The goal is to combine typed and spoken AI chat with carefully permissioned local computer tools.

> **Status:** Documentation and roadmap are being established. The repository's application implementation, runtime behavior, provider integrations, and tests have not yet been verified. Do not treat planned features as shipped.

## Product direction
- Electron, Node.js, HTML, CSS, and vanilla JavaScript.
- OpenRouter and Groq as initial provider options; Gemini via Google AI Studio is a future integration until implemented and tested.
- Typed chat, optional speech recognition and speech output, local conversation history.
- Restricted file and folder tools within a user-approved workspace.
- Clear confirmations for consequential actions; no arbitrary shell execution.

## Quick start
The application is not yet verified as runnable. Once `package.json` and application source are implemented:
1. Install a currently supported Node.js LTS release.
2. Clone this repository and enter its folder.
3. Run `npm install`.
4. Run `npm start` if the package script has been added and verified.

These commands are the intended workflow, not a claim that the current repository already supports them.

## Providers
Provider configuration is planned for Settings. Never commit API keys. Consult [AI providers](docs/AI_PROVIDERS.md) before implementing an adapter. API usage may incur charges or rate limits depending on provider/account.

## Permissions and voice
Voice support depends on browser/OS capabilities and permissions. The planned filesystem tools must remain restricted to an explicitly approved workspace. See [Security](docs/SECURITY.md).

## Documentation
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

## Troubleshooting
- If startup fails, inspect the exact error and check that the installed Node.js version meets the package's declared engine requirement.
- If chat cannot connect, verify provider selection, key, model ID, network access, provider status, and rate limits. Never paste secrets into issues or logs.
- If microphone input is unavailable, check OS/app permission and use typed input.
- If a feature is listed as planned, it is not available until implemented and verified.

## Security
Keep renderer privileges minimal, validate all tool arguments in the main process, scope filesystem access to approved paths, and ask for confirmation before consequential operations. Read [SECURITY.md](docs/SECURITY.md) before contributing.
