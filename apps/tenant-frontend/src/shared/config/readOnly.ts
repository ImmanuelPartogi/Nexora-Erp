// ────────────────────────────────────────────────────────────────
// READ-ONLY / DEMO MODE TOGGLE
// ────────────────────────────────────────────────────────────────
// Driven by the `VITE_READ_ONLY` environment variable.
// Set `VITE_READ_ONLY=true` in your .env / host config ➜ demo mode
// (hides all create/edit/delete/submit actions).
// Any other value (or unset) ➜ full editing capabilities.
export const READ_ONLY = import.meta.env.VITE_READ_ONLY === 'true';