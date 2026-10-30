# Accessibility audit

## Coverage

- one `h1` per main screen;
- navigations with accessible names;
- tabs, dialogs and forms operable by keyboard;
- error messages with `role="alert"` when needed;
- the timer with updates in an `aria-live` region;
- icon-only buttons with an `aria-label`;
- visible focus and reduced-motion preference;
- the mobile menu in an accessible dialog.

## Applied fix

The per-module reset buttons received names like `Resetar Notas`, avoiding controls without a description for screen readers.

## Residual risk

The final contrast depends on the combination of theme and browser settings. The automated audit complements, but doesn't replace, manual testing with a screen reader.
