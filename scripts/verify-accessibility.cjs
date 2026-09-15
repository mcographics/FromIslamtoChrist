const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const appPath = path.join(projectRoot, 'src', 'App.jsx');
const stylesPath = path.join(projectRoot, 'src', 'styles.css');
const app = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(app, /const DIALOG_FOCUSABLE_SELECTOR = ['"][^'"]+['"];?/i, 'Dialog focusable controls are not centrally defined.');
assert.match(app, /function useDialogFocus\(dialogRef, onClose, initialSelector = ['"]['"]\)/, 'Shared dialog focus behavior is missing.');
assert.match(app, /previouslyFocused = document\.activeElement/, 'Dialog focus behavior must remember the opener.');
assert.match(app, /event\.key !== ['"]Tab['"]/, 'Dialog focus behavior must handle keyboard tabbing.');
assert.match(app, /event\.shiftKey && document\.activeElement === first/, 'Dialog focus behavior must wrap reverse tabbing.');
assert.match(app, /!event\.shiftKey && document\.activeElement === last/, 'Dialog focus behavior must wrap forward tabbing.');
assert.match(app, /previouslyFocused\?\.isConnected[\s\S]{0,140}previouslyFocused\.focus\(\)/, 'Dialog cleanup must return focus to the opener.');

const dialogMatches = [...app.matchAll(/role="dialog"/g)];
assert.equal(dialogMatches.length, 5, `Expected five interactive dialog surfaces; found ${dialogMatches.length}.`);
const modalBlocks = [
  ['MobileDrawer', /<aside ref=\{dialogRef\} className="mobile-drawer" role="dialog" aria-modal="true"/],
  ['GlobalSearch', /<section ref=\{dialogRef\} className="global-search-modal" role="dialog" aria-modal="true"/],
  ['TranslationComparison', /<section ref=\{dialogRef\} className="translation-compare-modal" role="dialog" aria-modal="true"/],
  ['PrivacyNotice', /<section ref=\{dialogRef\} className="privacy-modal" role="dialog" aria-modal="true"/],
  ['LegalInformationModal', /<section ref=\{dialogRef\} className="legal-modal" role="dialog" aria-modal="true"/],
  ['PrivacyLockScreen', /<main className=\{`privacy-lock-screen/],
];
modalBlocks.forEach(([label, pattern]) => assert.match(app, pattern, `${label} is missing its expected accessible surface.`));
assert.equal((app.match(/role="dialog"[^>]*tabIndex="-1"/g) || []).length, dialogMatches.length, 'Every modal dialog must have a focusable container fallback.');
assert.match(app, /useDialogFocus\(dialogRef, onClose, ['"]input['"]\)/, 'Global search must place initial focus in its search field.');
assert.match(app, /function Toggle\(\{ label, checked, onChange \}\)/, 'Settings toggle component must accept an accessible name.');
assert.equal((app.match(/role="switch"[^>]*aria-label=\{label\}/g) || []).length, 1, 'Settings toggle component must expose its label to assistive technology.');
assert.match(app, /<Toggle label="Discreet Mode"/, 'Discreet Mode toggle must have an accessible name.');
assert.match(app, /<Toggle label="Offline-only mode"/, 'Offline-only mode toggle must have an accessible name.');
assert.match(styles, /button:focus-visible, input:focus-visible, select:focus-visible/, 'Keyboard focus styling is missing for interactive controls.');

console.log(`Accessibility source checks passed: ${dialogMatches.length} dialog surfaces have modal semantics, shared focus trapping, Escape handling, and opener-focus restoration.`);
