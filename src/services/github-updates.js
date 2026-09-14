import { Capacitor } from '@capacitor/core';

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.2.0';
export const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'mcographics';
export const GITHUB_REPOSITORY = import.meta.env.VITE_GITHUB_REPO || 'FromIslamtoChrist';
export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases`;

function versionParts(version) {
  return String(version || '0.0.0')
    .replace(/^v/i, '')
    .split(/[+-]/)[0]
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
}

function isNewerVersion(candidate, current) {
  const candidateParts = versionParts(candidate);
  const currentParts = versionParts(current);
  for (let index = 0; index < 3; index += 1) {
    if (candidateParts[index] !== currentParts[index]) return candidateParts[index] > currentParts[index];
  }
  return false;
}

export function getUpdatePlatform() {
  if (window.fromDarkness?.runtime === 'electron') return 'windows';
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
  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/releases/latest`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);

  const release = await response.json();
  const latestVersion = String(release.tag_name || '').replace(/^v/i, '');
  const asset = pickDownloadAsset(release.assets, platform);
  return {
    available: isNewerVersion(latestVersion, APP_VERSION),
    currentVersion: APP_VERSION,
    latestVersion,
    name: release.name || `From Darkness to Light ${latestVersion}`,
    notesUrl: release.html_url || GITHUB_RELEASES_URL,
    downloadUrl: asset?.browser_download_url || release.html_url || GITHUB_RELEASES_URL,
    assetName: asset?.name || null,
    platform,
    publishedAt: release.published_at || null,
  };
}

export async function openUpdateUrl(url) {
  if (!url) return;
  if (window.fromDarkness?.openExternal) {
    await window.fromDarkness.openExternal(url);
    return;
  }
  try {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
