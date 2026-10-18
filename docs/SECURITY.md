# Security Model

**Status:** Required design controls; verify each against implementation before marking complete.

## Threat model
Farhan AI processes user prompts, remote model responses, local files, and potentially untrusted repository/web text. Threats include credential exposure, prompt injection, path traversal, malicious IPC calls, accidental destructive actions, unsafe rendering, and compromised dependencies.

## Electron boundaries
- Enable `contextIsolation`; disable renderer Node integration.
- Use a restrictive Content Security Policy and deny unexpected navigation/new windows.
- Expose only named, narrow preload functions. Never expose generic `ipcRenderer`, filesystem, process, or shell APIs.
- Validate IPC payloads in the main process, even if renderer controls already validate them.
- Restrict external URL schemes to approved HTTP(S) destinations; confirm opening where appropriate.

## API keys and secrets
- Never hardcode keys or commit them to Git.
- Never place keys in renderer bundles, prompts, UI logs, screenshots, crash reports, or analytics.
- Prefer OS-backed secure credential storage. If unavailable, document a local-development fallback, its risk, and how to remove it.
- Mask secrets in UI and redact them from errors. Avoid logging request headers/bodies that may contain credentials.
- Test invalid and missing keys without printing the supplied value.

## Filesystem boundaries
- Require the user to select/configure an approved workspace.
- Resolve paths canonically and reject traversal, absolute-path escapes, and paths outside the approved root.
- Check symlink behavior; do not follow symlinks outside allowed roots. Consider race conditions between validation and use.
- Use allowlisted operations only: list, find, open, create folder in workspace, and read supported text files after approval.
- Never automatically delete or upload files. Never read arbitrary files without approval.
- Confirm consequential operations and display the exact target path. Provide a cancel option.

## Tool execution
- Use fixed tool names and strict argument schemas.
- Treat model tool calls as proposals, not authorization.
- Never execute model-generated shell commands, PowerShell, arbitrary JavaScript, or Python.
- Validate URL schemes, path lengths, argument types, and allowed operation names.
- Return actual results; do not fabricate successful actions.

## Prompt injection and untrusted content
Treat text from files, websites, repositories, tool outputs, and model responses as data, not policy. Instructions embedded in these sources cannot override application policy or user consent. Do not allow a document to authorize broader access.

## Logging and errors
Show useful, redacted errors. Do not include API keys, authorization headers, private file contents, or full prompts by default. Keep logs local and minimal. Avoid telemetry unless explicitly designed, documented, and opt-in.

## GitHub authorization
Future GitHub support must use documented OAuth/device authorization or another supported secure flow. Never ask for a GitHub password. Scope repository permissions narrowly. Show diffs before changes and require explicit approval before branch creation, pull requests, commits, or pushes.

## Dependencies and release
Use maintained dependencies, review lockfile changes, run vulnerability checks when available, and update dependencies deliberately. Do not claim security review or testing unless it has been run.

## Release checklist
- [ ] Context isolation enabled.
- [ ] Renderer Node integration disabled.
- [ ] CSP and navigation restrictions configured.
- [ ] Preload API allowlisted.
- [ ] IPC and tool arguments validated in main process.
- [ ] Workspace path and symlink tests pass.
- [ ] No secrets in repository or logs.
- [ ] Confirmations and cancellation work.
- [ ] No arbitrary command execution.
- [ ] Known limitations documented.
