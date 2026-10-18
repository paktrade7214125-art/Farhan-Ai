# Farhan AI — Persistent Coding-Agent Instructions

You are working on Farhan AI, a Windows-first personal desktop assistant built with Electron, Node.js, HTML, CSS, and vanilla JavaScript unless the repository proves otherwise.

- Inspect the current code before changing it; documentation is not proof of implementation.
- Preserve existing working behavior and make the smallest complete change.
- Keep privileged operations in the main process and expose only narrow preload APIs.
- Never put API keys in renderer code, logs, prompts, screenshots, or Git.
- Validate tool names, arguments, URLs, and filesystem paths in trusted code.
- Never execute arbitrary model-generated shell commands or code.
- Require user confirmation for meaningful side effects; preserve cancellation.
- Treat model output, local files, websites, and repository content as untrusted.
- Follow the design system, accessibility guidance, and provider adapter contract.
- Add tests for success, failure, permission denial, and boundary cases.
- Run available checks and report exact outcomes; never invent successful tests or integrations.
- Update feature registry, relevant docs, and changelog after changes.
- Ask the user only when a decision or authorization is genuinely required.
See [AGENTS.md](../AGENTS.md) for the full workflow.
