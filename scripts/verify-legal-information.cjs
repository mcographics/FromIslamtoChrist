const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const legalPath = path.join(root, 'src', 'data', 'legal-information.js');
const appPath = path.join(root, 'src', 'App.jsx');
const stylesPath = path.join(root, 'src', 'styles.css');
const packagePath = path.join(root, 'package.json');

const legalSource = fs.readFileSync(legalPath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');
const stylesSource = fs.readFileSync(stylesPath, 'utf8');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

assert.match(legalSource, /export const LEGAL_APP_INFO\s*=\s*\{/);
assert.match(legalSource, /creatorName:\s*'MCOGraphics'/);
assert.match(legalSource, /repositoryUrl:\s*'https:\/\/github\.com\/mcographics\/FromIslamtoChrist'/);
assert.match(legalSource, /export const LEGAL_TERMS_SECTIONS\s*=\s*\[/);
assert.match(legalSource, /export const LEGAL_RIGHTS_SECTIONS\s*=\s*\[/);
assert.match(legalSource, /export const LEGAL_SOURCE_CREDITS\s*=\s*\[/);
assert.match(legalSource, /export const LEGAL_SOFTWARE_CREDITS\s*=\s*\[/);
assert.match(legalSource, /export const LEGAL_EXTERNAL_SERVICES\s*=\s*\[/);
assert.match(legalSource, /MyMemory translation service/);
assert.match(legalSource, /BHSA/);
assert.match(legalSource, /N1904/);
assert.match(legalSource, /BHS-Strong-no/);
assert.match(legalSource, /Facts & Info manuscripts/);

assert.match(appSource, /from '\.\/data\/legal-information'/, 'App must import the in-app legal information record.');
assert.match(appSource, /title="About, terms & credits"/, 'Settings must expose the about, terms, and credits entry point.');
assert.match(appSource, /function LegalInformationModal\(/, 'The legal information must be available in an in-app modal.');
assert.match(appSource, /id="legal-terms"/, 'The in-app Terms & Conditions section is required.');
assert.match(appSource, /id="legal-rights"/, 'The in-app Rights & Usage section is required.');
assert.match(appSource, /id="legal-credits"/, 'The in-app Credits section is required.');
assert.match(appSource, /1,566 indexed local assets and 0 cleared assets/, 'The in-app legal record must show the current rights-review status.');
assert.match(appSource, /useDialogFocus\(dialogRef, onClose\)/, 'The legal modal must use the shared focus and Escape handling.');
assert.match(appSource, /LEGAL_LINK_HOSTS\s*=\s*new Set/, 'External legal links must use an explicit host allow-list.');
assert.match(appSource, /url\.protocol !== 'https:'/,
  'External legal links must require HTTPS.');

assert.match(stylesSource, /\.modal-backdrop\.legal-modal-backdrop/);
assert.match(stylesSource, /\.legal-modal\s*\{/);
assert.match(stylesSource, /\.legal-credit-list\s*\{/);
assert.match(stylesSource, /@media \(max-width: 720px\)[\s\S]*\.legal-modal/);

assert.equal(packageJson.scripts?.['verify:legal'], 'node scripts/verify-legal-information.cjs', 'package.json must expose the legal-information gate.');

console.log('Legal information verified: in-app Terms & Conditions, Rights & Usage, About, credits, source boundaries, and safe external-link handling are present.');
