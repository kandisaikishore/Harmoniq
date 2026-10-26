# Development, Music-Theory QA, and Accessibility Guide

Harmoniq provides interactive music-theory tools, including scale/chord exploration, piano and fretboard visualizations, a circle of fifths, staff notation, and AI-assisted mentoring as described in the README. Keep the documentation aligned with the current implementation.

## Setup and scripts

Inspect the package manifest for the supported runtime and the actual development, test, lint, and build scripts. Install dependencies using the project's package manager. Configure any AI-provider credentials locally and never commit API keys or private conversations.

## Music-theory regression tests

For implemented theory utilities, test:
- Valid and invalid root notes and scale/chord types
- Correct note sets and interval formulas for representative scales and chords
- Enharmonic spelling and octave boundaries where supported
- Consistent results when changing the selected root or mode
- Malformed natural-language requests and empty query results
- AI provider errors, timeouts, and malformed responses

Prefer deterministic unit tests for theory calculations; mock the AI provider so tests do not require live credentials or produce variable output.

## Visualization and accessibility

- Make interactive piano/fretboard controls keyboard-operable.
- Provide meaningful accessible names for notes and selected states.
- Keep focus visible and avoid color-only communication.
- Test responsive layout and verify that note labels remain understandable at supported viewport sizes.
- Ensure visual selection matches the underlying calculated note set.

## Pull-request checklist

- [ ] Add regression tests for any changed calculation or interaction.
- [ ] Run the current test/build scripts and report results.
- [ ] Verify keyboard interaction and accessible note labels for UI changes.
- [ ] Mock external AI calls in automated tests.
- [ ] Distinguish deterministic theory output from AI-generated suggestions.
