import { Capacitor, registerPlugin } from '@capacitor/core';

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.2.27';
export const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'mcographics';
export const GITHUB_REPOSITORY = import.meta.env.VITE_GITHUB_REPO || 'FromIslamtoChrist';
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases`;
const AndroidUpdater = registerPlugin('AndroidUpdater');

function versionParts(version) {
  return String(version || '0.0.0')
    .replace(/^v/i, '')
    .split(/[+-]/)[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isNewerVersion(candidate, current) {
  return compareVersions(candidate, current) > 0;
}

function compareVersions(left, right) {
  const candidateParts = versionParts(left);
  const currentParts = versionParts(right);
  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] !== currentParts[index]) return candidateParts[index] > currentParts[index] ? 1 : -1;
  }
  return 0;
}

export function getUpdatePlatform() {
  if (typeof window !== 'undefined' && window.fromDarkness?.runtime === 'electron') return 'windows';
  if (Capacitor.getPlatform() === 'android') return 'android';
  return 'web';
}

function pickDownloadAsset(assets, platform) {
  if (!Array.isArray(assets)) return null;
  const names = assets.map((asset) => ({ ...asset, lowerName: String(asset.name || '').toLowerCase() }));
  if (platform === 'android') return names.find((asset) => asset.lowerName.endsWith('.apk')) || null;
  if (platform === 'windows') return names.find((asset) => asset.lowerName.endsWith('.exe')) || names.find((asset) => asset.lowerName.endsWith('.msi')) || null;
  return null;
}

export async function checkForGitHubUpdate(platform = getUpdatePlatform()) {
  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases?per_page=20`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);

  const releases = await response.json();
  const release = (Array.isArray(releases) ? releases : [])
    .filter((candidate) => !candidate.draft && !candidate.prerelease)
    .map((candidate) => ({ ...candidate, updateAsset: pickDownloadAsset(candidate.assets, platform) }))
    .filter((candidate) => platform === 'web' || candidate.updateAsset)
    .sort((left, right) => compareVersions(right.tag_name, left.tag_name))[0];

  if (!release) {
    return {
      available: false,
      currentVersion: APP_VERSION,
      latestVersion: APP_VERSION,
      name: `From Islam to Christ ${APP_VERSION}`,
      notesUrl: GITHUB_RELEASES_URL,
      downloadUrl: null,
      assetName: null,
      platform,
    };
  }

  const latestVersion = String(release.tag_name || '').replace(/^v/i, '');
  const asset = release.updateAsset;
  const assetDigest = String(asset?.digest || '').replace(/^sha256:/i, '').toLowerCase() || null;
  return {
    available: isNewerVersion(latestVersion, APP_VERSION),
    currentVersion: APP_VERSION,
    latestVersion,
    name: release.name || `From Islam to Christ ${latestVersion}`,
    notesUrl: release.html_url || GITHUB_RELEASES_URL,
    downloadUrl: asset?.browser_download_url || release.html_url || GITHUB_RELEASES_URL,
    assetName: asset?.name || null,
    assetSize: asset?.size || null,
    assetSha256: assetDigest,
    platform,
    publishedAt: release.published_at || null,
  };
}

export async function downloadAndroidUpdate(update, onProgress) {
  if (getUpdatePlatform() !== 'android') throw new Error('The Android updater is only available on Android.');
  if (!update?.downloadUrl || !update?.latestVersion) throw new Error('GitHub did not provide a downloadable Android update.');

  const listener = await AndroidUpdater.addListener('downloadProgress', (progress) => onProgress?.(progress));
  try {
    return await AndroidUpdater.downloadUpdate({
      url: update.downloadUrl,
      version: update.latestVersion,
      expectedSha256: update.assetSha256 || '',
    });
  } finally {
    await listener.remove();
  }
}

export async function installAndroidUpdate() {
  if (getUpdatePlatform() !== 'android') throw new Error('The Android updater is only available on Android.');
  return AndroidUpdater.installUpdate();
}

export async function openAndroidInstallSettings() {
  if (getUpdatePlatform() !== 'android') throw new Error('The Android updater is only available on Android.');
  return AndroidUpdater.openInstallPermissionSettings();
}

export async function openUpdateUrl(url) {
  if (!url) return;
  if (getUpdatePlatform() === 'android') {
    throw new Error('Android updates are downloaded inside the app and are not opened in a browser.');
  }
  if (typeof window !== 'undefined' && window.fromDarkness?.openExternal) {
    await window.fromDarkness.openExternal(url);
    return;
  }
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
}
