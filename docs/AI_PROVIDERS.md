# AI Provider Integration

**Status:** OpenRouter and Groq are intended initial providers. Gemini is future scope unless a real adapter is implemented and tested.

## Adapter contract
A provider adapter should accept a normalized request (model ID, bounded messages, optional supported tool schema, timeout/signal) and return a normalized response. It must translate provider-specific errors into safe categories without exposing keys or sensitive request data.

Suggested categories: `MISSING_CONFIG`, `AUTHENTICATION_FAILED`, `RATE_LIMITED`, `MODEL_UNAVAILABLE`, `NETWORK_ERROR`, `TIMEOUT`, `INVALID_RESPONSE`, `PROVIDER_ERROR`.

## OpenRouter
- Use the current official OpenRouter API documentation for the endpoint, authorization format, request schema, and optional headers.
- Keep API keys in main-process secure configuration, never renderer code.
- Model IDs and provider behavior can change; do not claim a default is current without checking official documentation at implementation time.

## Groq
- Use the current official Groq API documentation for endpoint, authentication, model support, request fields, and tool-call behavior.
- Normalize provider-specific responses and error status codes.
- Verify model availability before choosing a default.

## Google AI Studio / Gemini — future
Gemini is not implemented merely because it is listed here. Before adding it, review current official Google AI for Developers documentation, authentication and key restrictions, model availability, supported request formats, safety behavior, and quota policies. Add a dedicated adapter and tests.

## Provider switching and configuration
- Provider, model ID, and key are configured in Settings.
- Validate required fields before sending.
- Mask keys in UI and never echo them back after save.
- Do not silently switch providers after a failure; explain the error and let the user choose.
- Do not log authorization headers or raw credential-bearing payloads.

## Timeouts, retries, and rate limits
Use a bounded timeout and cancellation where feasible. Avoid infinite retries. Retry only safe transient failures with a small bounded policy; respect provider rate-limit signals. Show a useful message and preserve the user's draft when possible.

## Normalized response
Normalize assistant text, supported tool proposals, and finish/error state. Validate any proposed tool name and arguments against the local allowlist. Never treat a provider response as proof a local action ran.

## Implementation checklist
- [ ] Official documentation checked at implementation time.
- [ ] Model availability verified.
- [ ] Missing/invalid key paths tested.
- [ ] Rate limit, timeout, network and malformed response paths tested.
- [ ] Keys redacted from logs and UI.
- [ ] Provider switching tested.
- [ ] Tests use mocked HTTP responses and do not require real secrets.
