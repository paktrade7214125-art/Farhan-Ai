# Development Workflow for Humans and AI Agents

1. Read `AGENTS.md`, `README.md`, `PRD.md`, `ARCHITECTURE.md`, and the relevant feature, security, provider, design, and roadmap docs.
2. Inspect the current source, package scripts, dependencies, tests, and repository status.
3. Restate the user problem and identify existing behavior that must be preserved.
4. Check whether similar functionality already exists; avoid duplicate modules.
5. Write a small implementation plan with files, acceptance criteria, and risks.
6. Identify security, privacy, compatibility, migration, and accessibility implications.
7. Implement the smallest complete, real feature. Do not add mock buttons or fake integrations.
8. Add or update unit/integration tests, especially for permissions and failure paths.
9. Run relevant tests, linting, type/syntax checks, and build/startup checks available in the project.
10. Review the diff for accidental secrets, unrelated edits, unsafe IPC, and regressions.
11. Update `docs/FEATURES.md`; update PRD for requirement changes and architecture docs/decision records for architecture changes.
12. Add a factual entry to `docs/CHANGELOG.md`.
13. Report changed files, exact checks run, pass/fail results, limitations, and unverified behavior.

## Definition of done
- Acceptance criteria are met.
- Tests cover new behavior and important failures.
- Security boundaries are preserved.
- Documentation matches the code.
- No secret or unrelated change is included.
- Any action requiring authorization was approved.
- Results are reported honestly.

## Git practices
Prefer focused changes and descriptive commits. Never force-push, commit, or push without explicit authorization. Review changes before proposing a pull request.
