# Farhan AI Design System

**Status:** Proposed visual and interaction guidance; align with actual UI once source exists.

## Principles
Professional, restrained, readable, calm, beginner-friendly. Prefer clear hierarchy and useful feedback over decorative effects. Subtle blue accent; consistent surfaces and spacing; SVG icons rather than emoji icons.

## Color tokens
Use semantic tokens rather than hard-coded colors throughout components. Verify contrast in both themes.
- Light: `--bg: #F7F9FC`, `--surface: #FFFFFF`, `--text: #182230`, `--muted: #667085`, `--border: #DDE3EA`, `--accent: #2563EB`, `--danger: #B42318`, `--success: #067647`.
- Dark: `--bg: #10151D`, `--surface: #171F2B`, `--text: #F2F4F7`, `--muted: #A5AFBD`, `--border: #303B4A`, `--accent: #7AA7FF`, `--danger: #FDA29B`, `--success: #6CE9A6`.
Check WCAG contrast before release; tokens are starting proposals, not certified contrast results.

## Typography and spacing
Use system UI sans-serif fonts. Body text 14–16px; secondary labels 12–13px; headings 18–24px with clear hierarchy. Spacing scale: 4, 8, 12, 16, 24, 32, 40px. Use consistent line height and readable message width.

## Layout
Collapsible sidebar with New Chat, Chat History, Settings. Main area contains conversation messages and a persistent composer. Layout should work on common laptop sizes and resize without clipping. Avoid fake statistics or decorative dashboard cards.

## Components
- **Message:** visually distinguish user and assistant; preserve whitespace; render Markdown safely.
- **Composer:** labelled text input, Send, microphone; keyboard submit behavior documented and consistent.
- **Status:** text plus icon for Ready, Listening, Processing, Speaking, and Error; never rely on color alone.
- **Settings:** provider selector, masked key input, model ID, Save and Test Connection.
- **Confirmation dialog:** name the action, show exact target/path, explain consequence, provide Cancel and explicit Confirm.
- **File preview:** show operation, scope, and destination before execution.
- **Empty state:** explain what the user can do next without fake activity.
- **Loading/error:** clear progress and actionable error; preserve draft on recoverable failures.

## Voice states
Microphone activation is user initiated. Show Listening visibly. Stop listening when appropriate, show permission errors, and always retain typed input. Speech output must have a Stop Speaking action while active.

## Accessibility
Semantic HTML; labels for every control; full keyboard navigation; visible focus ring; accessible names for SVG icons; sufficient contrast; no color-only meaning; respect reduced-motion preferences. Avoid focus traps except deliberate modal dialogs.

## Motion and icons
Use short, subtle transitions only when they clarify state. No looping decorative animations. Use consistent SVG/Lucide-style line icons with accessible labels; do not use emoji as UI icons.

## Naming
Use consistent component and CSS naming. Prefer semantic variables and state classes. Avoid styling by element position or incidental DOM structure.
