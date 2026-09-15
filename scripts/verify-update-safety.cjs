const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const updaterSource = fs.readFileSync(path.join(projectRoot, 'src', 'services', 'github-updates.js'), 'utf8');
const appSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf8');
const androidUpdaterSource = fs.readFileSync(path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', 'mcographics', 'fromdarknesstolight', 'AndroidUpdaterPlugin.java'), 'utf8');
const workflowSource = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf8');

assert.match(updaterSource, /const productionApks = names\.filter\([\s\S]*?debug[\s\S]*?unsigned/, 'Android update selection must reject debug and unsigned APK assets.');
assert.match(updaterSource, /from-islam-to-christ\[-_\].*\\.apk/, 'Android update selection must prefer the public product-named APK.');
assert.match(updaterSource, /expectedSha256: update\.assetSha256 \|\| ''/, 'Android downloads must pass the GitHub asset digest to the native verifier.');
assert.match(androidUpdaterSource, /validateDownloadUrl\(urlValue\)/, 'The native Android updater must validate the download URL before opening it.');
assert.match(androidUpdaterSource, /!"https"\.equals\(protocol\) \|\| !"github\.com"\.equals\(host\)/, 'The native Android updater must only accept HTTPS github.com downloads.');
assert.match(androidUpdaterSource, /!path\.endsWith\("\.apk"\)/, 'The native Android updater must reject non-APK downloads.');
assert.match(androidUpdaterSource, /failed its SHA-256 check/, 'The native Android updater must reject a digest mismatch.');
assert.match(appSource, /const showAction = isAndroid \? !isDownloading : platform === 'windows' \? isDownloaded : true/, 'Windows update banners must not expose a browser-download action while Electron auto-downloads.');
assert.match(appSource, /if \(platform === 'android'\) \{[\s\S]*installAndroidUpdate\(\)/, 'Android installation must stay on the native in-app update path.');
assert.match(appSource, /openUpdateUrl\(updateState\.downloadUrl \|\| updateState\.notesUrl \|\| GITHUB_RELEASES_URL\)/, 'Non-Android fallback navigation must remain explicit in the update handler.');
assert.match(workflowSource, /Sign Android release APK/, 'Tagged releases must sign the Android APK.');
assert.match(workflowSource, /From-Islam-to-Christ-\$releaseVersion\.apk/, 'Tagged releases must publish the product-named Android APK.');

console.log('Update safety verified: Android selects only production APK assets, validates GitHub URL and digest requirements, Windows keeps download/install inside Electron, and tagged releases publish a signed product-named APK.');
