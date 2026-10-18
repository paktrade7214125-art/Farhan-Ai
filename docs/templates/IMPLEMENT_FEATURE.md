# Implementation Prompt — Farhan AI

Implement this feature in the existing Farhan AI repository.

## Feature request
[REPLACE THIS LINE WITH THE USER'S FEATURE REQUEST]

## Required workflow
1. Read `AGENTS.md`, `README.md`, `PRD.md`, `ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/ROADMAP.md`, and relevant design/security/provider docs.
2. Inspect actual source, package scripts, dependencies, tests, and current repository changes before planning.
3. Check whether similar functionality already exists. Preserve working behavior and avoid unnecessary rewrites.
4. Define the smallest useful implementation, acceptance criteria, files to change, and risks.
5. Follow existing architecture and UI conventions. Keep privileged actions in the main process behind narrow validated interfaces.
6. Protect user data and credentials. Never expose keys in renderer code/logs or execute arbitrary model-generated commands.
7. Obtain explicit user approval for sensitive operations and provide cancellation.
8. Implement real functionality; do not leave fake buttons, mock success messages, or pretend integrations.
9. Add/update tests for normal behavior, errors, invalid inputs, and permission boundaries.
10. Run available tests, syntax checks, and build/startup checks. State any checks that could not run.
11. Review the diff for regressions, secrets, unsafe IPC, and unrelated changes.
12. Update feature registry, PRD if requirements changed, architecture/decision records if design changed, and changelog.
13. Report changed files, verified behavior, exact tests and outcomes, limitations, and next steps.

Do not claim any test, build, API integration, or operation succeeded unless its result is verified. Ask the user only when a genuine product decision or authorization is required.
