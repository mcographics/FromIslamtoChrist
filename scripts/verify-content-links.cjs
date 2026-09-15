const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const initSqlJs = require('sql.js');

const projectRoot = path.resolve(__dirname, '..');
const dataDirectory = path.join(projectRoot, 'src', 'data');
const databasePath = path.join(projectRoot, 'public', 'data', 'from-darkness-to-light.db');
const referenceKeys = new Set(['reference', 'references', 'reading']);
const actionTypes = new Set(['article', 'bible', 'path', 'lesson', 'view']);

function rowsFromResult(result) {
  if (!result?.[0]) return [];
  const [{ columns, values }] = result;
  return values.map((value) => Object.fromEntries(columns.map((column, index) => [column, value[index]])));
}

async function loadDataModules() {
  const filenames = fs.readdirSync(dataDirectory).filter((filename) => filename.endsWith('.js')).sort();
  return Promise.all(filenames.map(async (filename) => {
    const moduleUrl = pathToFileURL(path.join(dataDirectory, filename)).href;
    return { filename, module: await import(moduleUrl) };
  }));
}

function collectReferences(value, location, keyName, references) {
  if (Array.isArray(value)) {
    if (referenceKeys.has(keyName)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') references.push({ value: item, location: `${location}[${index}]` });
        else collectReferences(item, `${location}[${index}]`, keyName, references);
      });
      return;
    }
    value.forEach((item, index) => collectReferences(item, `${location}[${index}]`, keyName, references));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([key, child]) => {
    const childLocation = `${location}.${key}`;
    if (referenceKeys.has(key) && typeof child === 'string') references.push({ value: child, location: childLocation });
    else collectReferences(child, childLocation, key, references);
  });
}

function collectActionTargets(items, collectionName, destinationSets, books, resolveReference, actions) {
  items.forEach((item, itemIndex) => {
    (item.resources || item.steps || []).forEach((action, actionIndex) => {
      const location = `${collectionName}[${itemIndex}].${item.resources ? 'resources' : 'steps'}[${actionIndex}]`;
      if (!actionTypes.has(action.type)) {
        actions.push({ location, reason: `unsupported action type: ${action.type}` });
        return;
      }
      const target = action.target;
      const targetKey = String(target ?? '');
      const valid = action.type === 'article'
        ? destinationSets.articles.has(targetKey)
        : action.type === 'bible'
          ? Boolean(resolveReference(target, books))
          : action.type === 'path'
            ? destinationSets.paths.has(targetKey)
            : action.type === 'lesson'
              ? destinationSets.lessons.has(targetKey)
              : destinationSets.views.has(targetKey);
      if (!valid) actions.push({ location, reason: `${action.type} target does not resolve: ${targetKey}` });
    });
  });
}

async function main() {
  assert.ok(fs.existsSync(databasePath), `Missing content database: ${databasePath}`);
  const { resolveBibleReference } = await import(pathToFileURL(path.join(projectRoot, 'src', 'services', 'bible-reference.js')).href);
  const SQL = await initSqlJs({ locateFile: (fileName) => path.join(path.dirname(require.resolve('sql.js')), fileName) });
  const database = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  const books = rowsFromResult(database.exec(`
    SELECT book_id AS id,
      book_name AS name,
      abbreviation,
      chapter_count AS chapterCount
    FROM bible_books
    ORDER BY book_order
  `));
  const dataModules = await loadDataModules();
  const moduleValue = (filename) => dataModules.find((entry) => entry.filename === filename)?.module?.default || [];
  const staticAppSource = fs.readFileSync(path.join(projectRoot, 'src', 'App.jsx'), 'utf8');
  const staticArticleBlock = staticAppSource.slice(staticAppSource.indexOf('const articles = ['), staticAppSource.indexOf('const allArticles ='));
  const staticArticleIds = [...staticArticleBlock.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  const articleIds = new Set([
    ...staticArticleIds,
    ...moduleValue('discipleship-content.js').map((article) => article.id),
    ...moduleValue('facts-info-capsules.js').map((article) => article.id),
    ...moduleValue('muslim-questions.js').map((article) => article.id),
    ...moduleValue('scripture-testimonies.js').map((article) => article.id),
  ].map(String));
  const factsPaths = moduleValue('facts-info-reading-paths.js');
  const lessons = moduleValue('journey-content.js');
  const destinationSets = {
    articles: articleIds,
    paths: new Set(factsPaths.map((pathEntry) => String(pathEntry.id))),
    lessons: new Set(lessons.map((lesson) => String(lesson.id))),
    views: new Set(['home', 'bible', 'learn', 'prayer', 'journey', 'faith', 'saved', 'downloads', 'library', 'settings']),
  };
  const references = [];
  dataModules.forEach(({ filename, module }) => {
    Object.entries(module).forEach(([exportName, value]) => collectReferences(value, `${filename}:${exportName}`, exportName, references));
  });

  const unresolved = references.filter(({ value }) => !resolveBibleReference(value, books));
  assert.equal(unresolved.length, 0, `Unresolved Scripture references:\n${unresolved.map(({ location, value }) => `- ${location}: ${value}`).join('\n')}`);
  assert.ok(references.length > 300, `Expected the content library to expose more than 300 Scripture handoffs; found ${references.length}.`);

  const unresolvedActions = [];
  collectActionTargets(moduleValue('study-foci.js'), 'study-foci', destinationSets, books, resolveBibleReference, unresolvedActions);
  collectActionTargets(moduleValue('study-packs.js'), 'study-packs', destinationSets, books, resolveBibleReference, unresolvedActions);
  factsPaths.forEach((pathEntry, pathIndex) => {
    [...(pathEntry.sourceIds || []), ...(pathEntry.questionIds || [])].forEach((target, targetIndex) => {
      if (!destinationSets.articles.has(String(target))) unresolvedActions.push({ location: `facts-info-reading-paths[${pathIndex}].linkedArticles[${targetIndex}]`, reason: `article target does not resolve: ${target}` });
    });
  });
  assert.equal(unresolvedActions.length, 0, `Unresolved in-app actions:\n${unresolvedActions.map(({ location, reason }) => `- ${location}: ${reason}`).join('\n')}`);

  database.close();
  const actionCount = moduleValue('study-foci.js').reduce((count, focus) => count + focus.steps.length, 0)
    + moduleValue('study-packs.js').reduce((count, pack) => count + pack.resources.length, 0)
    + factsPaths.reduce((count, pathEntry) => count + (pathEntry.sourceIds || []).length + (pathEntry.questionIds || []).length, 0);
  console.log(`Content links verified: ${references.length} Scripture references and ${actionCount} in-app actions across ${dataModules.length} data modules, 0 unresolved.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
