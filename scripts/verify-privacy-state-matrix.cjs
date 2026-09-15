const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'src', 'App.jsx');
const androidPath = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'mcographics', 'fromdarknesstolight', 'PrivacyShieldPlugin.java');
const mainActivityPath = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'mcographics', 'fromdarknesstolight', 'MainActivity.java');
const electronPath = path.join(root, 'electron', 'main.cjs');
const splashPath = path.join(root, 'electron', 'splash.html');

function read(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing privacy state file: ${path.relative(root, filePath)}`);
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(`Privacy state matrix failed: ${message}`);
}

function state({ onboardingComplete, discreetMode, startupEntered }) {
  return {
    protected: !onboardingComplete || discreetMode,
    neutralStartup: onboardingComplete && discreetMode && !startupEntered,
    taskLabel: onboardingComplete && discreetMode && !startupEntered ? 'Private space' : 'From Islam to Christ',
  };
}

const cases = [
  {
    name: 'fresh first launch',
    input: { onboardingComplete: false, discreetMode: true, startupEntered: true },
    expected: { protected: true, neutralStartup: false, taskLabel: 'From Islam to Christ' },
  },
  {
    name: 'completed onboarding with Discreet Mode disabled',
    input: { onboardingComplete: true, discreetMode: false, startupEntered: true },
    expected: { protected: false, neutralStartup: false, taskLabel: 'From Islam to Christ' },
  },
  {
    name: 'active protected session after intentional entry',
    input: { onboardingComplete: true, discreetMode: true, startupEntered: true },
    expected: { protected: true, neutralStartup: false, taskLabel: 'From Islam to Christ' },
  },
  {
    name: 'next launch with Discreet Mode enabled',
    input: { onboardingComplete: true, discreetMode: true, startupEntered: false },
    expected: { protected: true, neutralStartup: true, taskLabel: 'Private space' },
  },
  {
    name: 'onboarding reset',
    input: { onboardingComplete: false, discreetMode: true, startupEntered: true },
    expected: { protected: true, neutralStartup: false, taskLabel: 'From Islam to Christ' },
  },
];

for (const testCase of cases) {
  const actual = state(testCase.input);
  assert(JSON.stringify(actual) === JSON.stringify(testCase.expected), `${testCase.name} produced ${JSON.stringify(actual)}`);
}

const app = read(appPath);
const android = read(androidPath);
const mainActivity = read(mainActivityPath);
const electron = read(electronPath);
const splash = read(splashPath);

assert(/if \(privacyPin && privacyLocked\)/.test(app), 'the local lock gate must remain before protected content');
assert(/if \(!onboardingComplete\)/.test(app) && /if \(discreetMode && !discreetStartupEntered\)/.test(app), 'the renderer must separate first-launch onboarding from later neutral startup');
assert(/setStartupPrivacy\?\.\(\{ discreetMode, onboardingComplete, startupEntered: discreetStartupEntered \}\)/.test(app), 'Android must receive the intentional startup-entry transition');
assert(/protectedWindow = !onboardingComplete \|\| discreetMode/.test(electron), 'Electron content protection must cover onboarding and Discreet Mode');
assert(/neutralStartup = onboardingComplete && discreetMode && !startupEntered/.test(electron), 'Electron neutral startup must require completed onboarding, enabled Discreet Mode, and no entry yet');
assert(/shouldUseNeutralStartup\(this\)/.test(mainActivity), 'Android must select its native splash from stored startup state');
assert(/applyStoredPrivacy\(this\)/.test(mainActivity) && /FLAG_SECURE/.test(android), 'Android must protect the Activity before and during the WebView lifecycle');
assert(/getBoolean\("startupEntered", true\)/.test(android), 'Android must default a missing transition to branded first-launch behavior');
assert(/applyTaskIdentity\(activity, onboardingComplete && discreetMode && !startupEntered\)/.test(android), 'Android must neutralize the task title only before intentional entry');
assert(/data-branded-src/.test(splash) && /body\.neutral-startup img \{ display: none; \}/.test(splash), 'neutral Electron splash must avoid loading the branded image');

const neutralStartupSection = app.match(/function NeutralStartupScreen[\s\S]*?(?=\nfunction |\nexport default)/)?.[0] || '';
assert(neutralStartupSection && !/Jesus|Christ|Bible|Christian/i.test(neutralStartupSection), 'the later neutral renderer surface must not use explicit Christian wording');

console.log(`Privacy state matrix verified: ${cases.length} lifecycle cases, early Android protection, neutral task identity, Electron protection, and neutral renderer wording.`);
