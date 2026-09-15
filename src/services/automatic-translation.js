import { isKnownLanguageText, LANGUAGE_OPTIONS } from './language';

const TRANSLATION_ENDPOINT = 'https://api.mymemory.translated.net/get';
const TARGET_LANGUAGE_BY_ID = Object.fromEntries(LANGUAGE_OPTIONS.filter(({ id }) => id !== 'en').map(({ id, locale }) => [id, locale.split('-')[0]]));
const CACHE_PREFIX = 'fdl-automatic-translations-v1';
const CACHE_LIMIT = 5000;
const MAX_QUERY_LENGTH = 450;
const MAX_CONCURRENT_REQUESTS = 2;
const TEXT_PROTECTION_SELECTOR = [
  'script',
  'style',
  'noscript',
  '[aria-hidden="true"]',
  '[data-no-translate="true"]',
  '[data-private-content="true"]',
  'textarea',
  'input',
  '[contenteditable="true"]',
].join(',');
const ATTRIBUTE_PROTECTION_SELECTOR = [
  'script',
  'style',
  'noscript',
  '[data-no-translate="true"]',
  '[data-private-content="true"]',
].join(',');
const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title', 'placeholder', 'alt'];
const TRANSLATION_STATUS_EVENT = 'fdl-translation-status';

const requestQueue = [];
let activeRequests = 0;
const pendingTranslations = new Map();
const failedTranslations = new Map();
const activeControllers = new Set();
let translationOfflineOnly = false;

export function setAutomaticTranslationOffline(enabled) {
  const nextValue = Boolean(enabled);
  if (nextValue && !translationOfflineOnly) activeControllers.forEach((controller) => controller.abort());
  translationOfflineOnly = nextValue;
}

export function clearAutomaticTranslationCache() {
  if (typeof window === 'undefined') return;
  const keys = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(`${CACHE_PREFIX}:`)) keys.push(key);
  }
  keys.forEach((key) => window.localStorage.removeItem(key));
}

function emitTranslationStatus(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TRANSLATION_STATUS_EVENT, { detail }));
}

function cacheKey(languageId) {
  return `${CACHE_PREFIX}:${languageId}`;
}

function loadCache(languageId) {
  try {
    const stored = window.localStorage.getItem(cacheKey(languageId));
    const parsed = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(languageId, cache) {
  try {
    const entries = Object.entries(cache).slice(-CACHE_LIMIT);
    window.localStorage.setItem(cacheKey(languageId), JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Translation caching is an enhancement. A full storage area must not break reading.
  }
}

function enqueueRequest(task) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ task, resolve, reject });
    pumpRequests();
  });
}

function pumpRequests() {
  while (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const request = requestQueue.shift();
    activeRequests += 1;
    Promise.resolve()
      .then(request.task)
      .then(request.resolve, request.reject)
      .finally(() => {
        activeRequests -= 1;
        pumpRequests();
      });
  }
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isTranslatableSource(value) {
  return /[A-Za-z]/.test(value);
}

function preserveWhitespace(original, replacement) {
  const leading = String(original).match(/^\s*/)?.[0] || '';
  const trailing = String(original).match(/\s*$/)?.[0] || '';
  return `${leading}${replacement}${trailing}`;
}

function splitForTranslation(value) {
  if (value.length <= MAX_QUERY_LENGTH) return [value];
  const sentences = value.split(/(?<=[.!?。！？])\s+/);
  const chunks = [];
  let current = '';
  sentences.forEach((sentence) => {
    if (!sentence) return;
    if (current && `${current} ${sentence}`.length > MAX_QUERY_LENGTH) {
      chunks.push(current);
      current = '';
    }
    if (sentence.length <= MAX_QUERY_LENGTH) {
      current = current ? `${current} ${sentence}` : sentence;
      return;
    }
    const words = sentence.split(/\s+/);
    words.forEach((word) => {
      if (current && `${current} ${word}`.length > MAX_QUERY_LENGTH) {
        chunks.push(current);
        current = '';
      }
      current = current ? `${current} ${word}` : word;
    });
  });
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [value.slice(0, MAX_QUERY_LENGTH)];
}

async function fetchTranslation(source, targetLanguage) {
  if (translationOfflineOnly) return null;
  const query = `${TRANSLATION_ENDPOINT}?q=${encodeURIComponent(source)}&langpair=${encodeURIComponent(`en|${targetLanguage}`)}`;
  const controller = new AbortController();
  activeControllers.add(controller);
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(query, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Translation service returned ${response.status}`);
    const payload = await response.json();
    if (Number(payload?.responseStatus ?? 200) !== 200) {
      throw new Error(`Translation service rejected the request (${payload?.responseStatus ?? 'unknown'})`);
    }
    const translated = normalizeText(payload?.responseData?.translatedText);
    if (!translated || /^please select two distinct languages/i.test(translated)) return null;
    return translated;
  } finally {
    window.clearTimeout(timeout);
    activeControllers.delete(controller);
  }
}

async function translateText(source, languageId, cache) {
  if (languageId === 'en' || isKnownLanguageText(languageId, source)) return source;
  if (cache[source]) return cache[source];
  if (translationOfflineOnly) return null;
  const targetLanguage = TARGET_LANGUAGE_BY_ID[languageId];
  const pendingKey = `${languageId}|${source}`;
  const failedAt = failedTranslations.get(pendingKey);
  if (!targetLanguage || (failedAt && Date.now() - failedAt < 30000)) return null;
  if (failedAt) failedTranslations.delete(pendingKey);

  if (pendingTranslations.has(pendingKey)) return pendingTranslations.get(pendingKey);

  const promise = (async () => {
    const chunks = splitForTranslation(source);
    const translatedChunks = [];
    for (const chunk of chunks) {
      const translated = await enqueueRequest(() => fetchTranslation(chunk, targetLanguage));
      if (!translated) {
        failedTranslations.set(pendingKey, Date.now());
        return null;
      }
      translatedChunks.push(translated);
    }
    const translated = normalizeText(translatedChunks.join(' '));
    if (!translated || translated === source) {
      failedTranslations.set(pendingKey, Date.now());
      return null;
    }
    cache[source] = translated;
    saveCache(languageId, cache);
    return translated;
  })().catch(() => {
    failedTranslations.set(pendingKey, Date.now());
    return null;
  }).finally(() => pendingTranslations.delete(pendingKey));

  pendingTranslations.set(pendingKey, promise);
  return promise;
}

export function getCachedAutomaticTranslation(source, languageId) {
  if (languageId === 'en') return normalizeText(source);
  return loadCache(languageId)[normalizeText(source)] || null;
}

export function requestAutomaticTranslation(source, languageId) {
  const normalized = normalizeText(source);
  if (!normalized || languageId === 'en') return Promise.resolve(normalized);
  return translateText(normalized, languageId, loadCache(languageId));
}

function shouldProtectTextNode(node) {
  const parent = node.parentElement;
  if (!parent || parent.closest(TEXT_PROTECTION_SELECTOR)) return true;
  return false;
}

function shouldProtectAttribute(element) {
  return Boolean(element.closest(ATTRIBUTE_PROTECTION_SELECTOR));
}

function collectTextNodes(root, state, languageId) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!shouldProtectTextNode(node)) {
      const raw = node.nodeValue || '';
      const record = state.nodes.get(node);
      const alreadyTranslated = record && normalizeText(raw) === record.translated;
      const source = alreadyTranslated ? record.source : normalizeText(raw);
      if (alreadyTranslated) {
        node = walker.nextNode();
        continue;
      }
      if (source.length >= 2 && isTranslatableSource(source) && !isKnownLanguageText(languageId, source)) nodes.push({ node, source, raw });
    }
    node = walker.nextNode();
  }
  return nodes;
}

function collectAttributes(root, state, languageId) {
  const attributes = [];
  root.querySelectorAll(TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(','))
    .forEach((element) => {
      if (shouldProtectAttribute(element)) return;
      TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const raw = element.getAttribute(attribute) || '';
        const record = state.attributes.get(element)?.[attribute];
        const alreadyTranslated = record && normalizeText(raw) === record.translated;
        if (alreadyTranslated) return;
        const source = normalizeText(raw);
        if (source.length >= 2 && isTranslatableSource(source) && !isKnownLanguageText(languageId, source)) attributes.push({ element, attribute, source });
      });
    });
  return attributes;
}

export function startAutomaticTranslation(languageId, root = document.getElementById('root')) {
  if (!root || languageId === 'en' || !TARGET_LANGUAGE_BY_ID[languageId]) return () => undefined;

  const state = {
    nodes: new Map(),
    attributes: new Map(),
    cache: loadCache(languageId),
    disposed: false,
    running: false,
    timer: null,
    retryTimer: null,
    needsAnotherRun: false,
  };

  function publish(status, extra = {}) {
    emitTranslationStatus({
      languageId,
      status,
      ...extra,
    });
  }

  async function translateSurface() {
    if (state.disposed) return;
    if (state.running) {
      state.needsAnotherRun = true;
      return;
    }
    state.running = true;
    state.needsAnotherRun = false;
    let retryNeeded = false;
    let translatedCount = 0;
    let failedCount = 0;
    const offlineOnly = translationOfflineOnly;
    try {
      const nodes = collectTextNodes(root, state, languageId);
      const attributes = collectAttributes(root, state, languageId);
      const pending = nodes.length + attributes.length;
      publish(pending > 0 ? 'translating' : 'ready', { pending });
      await Promise.all(nodes.map(async ({ node, source, raw }) => {
        const translated = await translateText(source, languageId, state.cache);
        if (!translated) {
          if (!offlineOnly) {
            retryNeeded = true;
            failedCount += 1;
          }
          return;
        }
        translatedCount += 1;
        if (state.disposed || !node.isConnected) return;
        const current = node.nodeValue || '';
        const record = state.nodes.get(node);
        const currentSource = record && normalizeText(current) === record.translated ? record.source : normalizeText(current);
        if (currentSource === source) {
          if (normalizeText(current) !== translated) node.nodeValue = preserveWhitespace(raw, translated);
          state.nodes.set(node, { source, translated });
        }
      }));
      await Promise.all(attributes.map(async ({ element, attribute, source }) => {
        const translated = await translateText(source, languageId, state.cache);
        if (!translated) {
          if (!offlineOnly) {
            retryNeeded = true;
            failedCount += 1;
          }
          return;
        }
        translatedCount += 1;
        if (state.disposed || !element.isConnected) return;
        const current = element.getAttribute(attribute) || '';
        const record = state.attributes.get(element)?.[attribute];
        const currentSource = record && normalizeText(current) === record.translated ? record.source : normalizeText(current);
        if (currentSource !== source) return;
        if (normalizeText(current) !== translated) element.setAttribute(attribute, preserveWhitespace(current, translated));
        state.attributes.set(element, { ...(state.attributes.get(element) || {}), [attribute]: { source, translated } });
      }));
      publish(offlineOnly ? 'offline' : retryNeeded ? 'partial' : 'ready', {
        pending: offlineOnly ? 0 : failedCount,
        translated: translatedCount,
        failed: failedCount,
      });
    } finally {
      state.running = false;
      if (retryNeeded && !state.disposed && !state.retryTimer) {
        state.retryTimer = window.setTimeout(() => {
          state.retryTimer = null;
          schedule();
        }, 30000);
      }
      if (state.needsAnotherRun && !state.disposed) schedule();
    }
  }

  function schedule() {
    if (state.disposed) return;
    if (state.running) {
      state.needsAnotherRun = true;
      return;
    }
    if (state.timer) return;
    state.timer = window.setTimeout(() => {
      state.timer = null;
      translateSurface();
    }, 160);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: TRANSLATABLE_ATTRIBUTES });
  const retryListener = (event) => {
    if (event.detail?.languageId === languageId) {
      failedTranslations.clear();
      schedule();
    }
  };
  window.addEventListener('fdl-translation-retry', retryListener);
  schedule();

  return () => {
    state.disposed = true;
    observer.disconnect();
    window.removeEventListener('fdl-translation-retry', retryListener);
    if (state.timer) window.clearTimeout(state.timer);
    if (state.retryTimer) window.clearTimeout(state.retryTimer);
    state.nodes.forEach(({ source }, node) => {
      if (node.isConnected) node.nodeValue = preserveWhitespace(node.nodeValue || '', source);
    });
    state.attributes.forEach((records, element) => {
      if (!element.isConnected) return;
      Object.entries(records).forEach(([attribute, { source }]) => element.setAttribute(attribute, source));
    });
    publish('idle', { pending: 0 });
  };
}
