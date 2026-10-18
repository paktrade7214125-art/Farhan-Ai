# Feature Registry

Statuses: `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `BLOCKED`, `DEPRECATED`. A feature may be VERIFIED only after relevant tests or behavior checks pass.

> Current status is conservative: the application implementation has not been inspected or tested in this documentation pass. Planned features are not claimed as shipped.

| ID | Feature | Purpose | Status | Requirements / dependencies | Acceptance criteria | Tests / limitations |
|---|---|---|---|---|---|---|
| F-001 | Electron shell and UI | Desktop entry point | PLANNED | Electron, design system | Starts without renderer Node access; core UI usable | Startup/IPC/CSP tests needed |
| F-002 | Provider settings | Configure provider, key, model | PLANNED | Secure storage, adapter layer | Save/test works; secrets masked and redacted | Missing/invalid key tests needed |
| F-003 | AI chat | Real provider responses | PLANNED | F-002, network | Actual response shown; errors honest | Mock response/error tests needed |
| F-004 | Local history | Reopen and delete chats | PLANNED | Local persistence | Conversations persist; delete confirms | Persistence/corruption tests needed |
| F-005 | Voice input/output | Hands-free interaction | PLANNED | Web Speech APIs | User-initiated recognition; typed fallback; stop output | Browser/OS dependent |
| F-006 | Safe filesystem tools | Find/list/open/create/read approved items | PLANNED | Workspace permissions | Paths remain in approved root; real results shown | Traversal/symlink tests needed |
| F-007 | Website and system tools | Open approved URL; report time | PLANNED | Main-process tool registry | Only allowed URL schemes; OS result surfaced | URL validation tests needed |
| F-008 | Project-aware coding | Read-only analysis and diffs | PLANNED | V2, workspace tools | Project scope shown; diffs before writes | V2 |
| F-009 | GitHub integration | Authorized repo operations | PLANNED | OAuth/token security | Scoped access; writes approved | Future |
| F-010 | Gemini adapter | Additional AI provider | PLANNED | Official docs and adapter tests | Real tested request/response path | Future; not connected |
| F-011 | Browser automation | Narrow workflows | PLANNED | Security review, visible control | User sees and approves actions | Future; not available |

Update this registry alongside code changes. Add source paths only after verifying the actual files.
