# Roadmap: V1, V2, and Future Phases

This roadmap is a proposal, not evidence that a feature is implemented. Prioritize verified foundations and security over breadth.

## V1 — Dependable personal assistant
**Goal:** a small, usable Windows desktop assistant.
- Electron shell and polished accessible UI.
- Provider settings and real chat through OpenRouter/Groq adapters.
- Local conversation history and safe Markdown rendering.
- Voice input where supported, typed fallback, optional speech output.
- Restricted local tools: list/find files in approved workspace, open approved files/folders, create workspace folders, read approved text files, report time, open approved websites.
- Permission prompts, cancellation, safe error handling, tests, and beginner setup docs.

**Dependencies:** Electron project scaffold, provider adapter contract, permission layer.  
**Risks:** credential handling, IPC exposure, variable speech support, filesystem boundary bugs.  
**Exit criteria:** PRD V1 release criteria pass; tests cover provider failures and workspace escape attempts; all status claims match code.

## V2 — Project-aware assistant and reviewed changes
**Goal:** help users understand and improve local projects without autonomous, unreviewed changes.
- Read-only project inspection within approved workspace.
- Project-aware Q&A and file summaries with explicit user-selected scope.
- Code suggestions and patch/diff previews.
- User-approved application of a reviewed patch, with backups or reversible workflow where practical.
- Improved test runner integration limited to known, user-approved commands; no model-generated arbitrary command execution.
- Better diagnostics, onboarding, accessibility, and settings validation.

**Dependencies:** verified V1 permission and filesystem foundation, robust diff representation, tests.  
**Risks:** prompt injection in project files, sensitive data in source, unsafe patch application.  
**Exit criteria:** project boundaries enforced; diffs shown before write; explicit approval required; tests cover malformed/out-of-scope patches and rollback behavior.

## V3 — Authorized GitHub integration
- Secure documented account authorization and least-privilege scopes.
- List authorized repositories and inspect files.
- Propose changes and display diffs.
- Branch and pull request creation only after explicit user authorization.
**Risks:** token leakage, excess scopes, unintended remote changes.  
**Exit criteria:** authorization flow and token storage reviewed; all writes require approval; integration tests cover denied/revoked access.

## V4 — Additional providers and carefully scoped automation
- Gemini via Google AI Studio after official documentation review and tested adapter.
- Additional provider adapters behind the same contract.
- Browser automation only for narrowly defined, user-approved workflows with visible actions and confirmations.
- More local workflows if evidence of user need supports them.
**Risks:** API changes, provider-specific safety differences, browser content prompt injection.  
**Exit criteria:** adapter conformance tests, clear capability indicators, explicit permissions and cancellation.

## Phase gates
At the end of each phase: review acceptance criteria, test results, security implications, user value, and maintenance cost. Reorder only with documented rationale. Never mark a phase complete from a plan alone.
