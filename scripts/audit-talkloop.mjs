import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appRoot = path.join(repoRoot, 'talkloop');
const dataFiles = [
  'v8-data.js',
  'v11-social-1.js',
  'v11-social-2.js',
  'v11-social-3.js',
  'v11-social-4.js',
  'v11-social-5.js',
];

const sandbox = {};
sandbox.window = sandbox;
sandbox.sessionStorage = { getItem: () => null, setItem: () => {} };
vm.createContext(sandbox);

for (const file of dataFiles) {
  const source = fs.readFileSync(path.join(appRoot, file), 'utf8');
  vm.runInContext(source, sandbox, { filename: file });
}

const { SCENES, ITEMS, DIALOGUES } = vm.runInContext(
  '({ SCENES, ITEMS, DIALOGUES })',
  sandbox,
);

const errors = [];
const warnings = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const requiredSceneFields = ['id', 'zh', 'tag', 'meta', 'img', 'expressions'];
const requiredItemFields = ['id', 'scene', 'en', 'jp', 'cn', 'func', 'action', 'role'];
const sceneIds = SCENES.map((scene) => scene.id);
const itemIds = ITEMS.map((item) => item.id);

assert(SCENES.length === 30, `expected 30 scenes, found ${SCENES.length}`);
assert(ITEMS.length === 600, `expected 600 expressions, found ${ITEMS.length}`);
assert(new Set(sceneIds).size === sceneIds.length, 'scene ids are not unique');
assert(new Set(itemIds).size === itemIds.length, 'expression ids are not unique');
assert(Object.keys(DIALOGUES).length === SCENES.length, 'dialogue and scene counts differ');

for (const scene of SCENES) {
  for (const field of requiredSceneFields) {
    assert(Boolean(scene[field]), `scene ${scene.id || '(unknown)'} is missing ${field}`);
  }
  assert(scene.expressions.length === 20, `scene ${scene.id} has ${scene.expressions.length} expressions`);
  const turns = DIALOGUES[scene.id];
  assert(Array.isArray(turns), `scene ${scene.id} has no dialogue`);
  assert(turns?.length >= 10 && turns?.length <= 12, `scene ${scene.id} has ${turns?.length || 0} dialogue turns`);
}

for (const item of ITEMS) {
  for (const field of requiredItemFields) {
    assert(Boolean(item[field]), `expression ${item.id || '(unknown)'} is missing ${field}`);
  }
  assert(sceneIds.includes(item.scene.id), `expression ${item.id} references unknown scene ${item.scene.id}`);
  assert(item.id === `${item.scene.id}-${item.pi}`, `expression ${item.id} has inconsistent scene/index identity`);
  assert(item.role === 'u' || item.role === 'p', `expression ${item.id} has invalid role ${item.role}`);
}

const duplicates = (field) => {
  const groups = new Map();
  for (const item of ITEMS) {
    const key = item[field].trim().toLocaleLowerCase();
    const group = groups.get(key) || [];
    group.push(item.id);
    groups.set(key, group);
  }
  return [...groups.entries()].filter(([, ids]) => ids.length > 1);
};

const duplicateEnglish = duplicates('en');
const duplicateJapanese = duplicates('jp');
if (duplicateEnglish.length > 45) warnings.push(`high exact English duplication: ${duplicateEnglish.length} repeated lines`);
if (duplicateJapanese.length > 45) warnings.push(`high exact Japanese duplication: ${duplicateJapanese.length} repeated lines`);

const html = fs.readFileSync(path.join(appRoot, 'index.html'), 'utf8');
const mediaSource = fs.readFileSync(path.join(appRoot, 'v11-media.js'), 'utf8');
const uiSource = fs.readFileSync(path.join(appRoot, 'v11-ui.js'), 'utf8');
const baseCss = fs.readFileSync(path.join(appRoot, 'v9.css'), 'utf8');
const uiCss = fs.readFileSync(path.join(appRoot, 'v11.css'), 'utf8');
const cacheVersions = [...html.matchAll(/[?&]v=([\d.]+)/g)].map((match) => match[1]);

assert(cacheVersions.length > 0, 'no cache-busting versions found in index.html');
assert(new Set(cacheVersions).size === 1, 'index.html loads mixed asset versions');
assert(html.includes('v11-media.js'), 'current media orchestrator is not loaded');
assert(!html.includes('v10-media.js'), 'legacy v10 media orchestrator is still loaded');
assert(html.includes('class="mascotStage"'), 'interactive mascot is missing');
assert(!html.includes('继续真实对话'), 'removed hero copy is still visible');
assert(!/>\s*TalkLoop\s*</i.test(html), 'visible TalkLoop brand text is still present');
assert(html.includes('viewport-fit=cover'), 'iPhone safe-area viewport support is missing');
assert((html.match(/<video[^>]*playsinline[^>]*muted/g) || []).length === 2, 'both training videos must be inline and muted');
const staticIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert(new Set(staticIds).size === staticIds.length, 'index.html contains duplicate element ids');
const appIndex = html.indexOf('v9-app.js');
const mediaIndex = html.indexOf('v11-media.js');
const uiIndex = html.indexOf('v11-ui.js');
assert(appIndex > 0 && mediaIndex > appIndex && uiIndex > mediaIndex, 'application/media/ui scripts load in the wrong order');
assert(uiSource.includes('openCoverage'), 'coverage modal interaction is missing');
assert(uiSource.includes('6个月做十年的训练密度'), 'time-compression training principle is missing');
assert(uiSource.includes("app.addEventListener('scroll'"), 'outer-shell scroll lock is missing');
assert(mediaSource.includes("l==='jp'"), 'Japanese media branch is missing');
assert(mediaSource.includes('talkloop12-dead-media'), 'failed-media session isolation is missing');
assert(baseCss.includes('height:100dvh;overflow:hidden'), 'viewport shell is not locked to dynamic mobile height');
assert(baseCss.includes('.content{flex:1;min-height:0;overflow:auto'), 'content is not the dedicated scroll container');
assert(uiCss.includes('.page.on{min-height:calc(100dvh - 166px)}'), 'active page does not fill the mobile viewport');
assert(uiCss.includes('#learn .lessonBody{min-height:292px}'), 'training text region was not expanded');
assert(uiCss.includes('.coverageSheet{max-width:560px;margin:0 auto}'), 'coverage sheet width guard is missing');
assert(uiCss.includes('@media(max-width:600px)'), 'phone layout breakpoint is missing');
assert(uiCss.includes('env(safe-area-inset-bottom)'), 'bottom safe-area spacing is missing');

const sceneFamilyMatch = mediaSource.match(/const SCENE_FAMILY=(\{[\s\S]*?\});/);
assert(Boolean(sceneFamilyMatch), 'scene-to-media mapping is missing');
if (sceneFamilyMatch) {
  const sceneFamily = JSON.parse(sceneFamilyMatch[1]);
  const mappedSceneIds = Object.keys(sceneFamily);
  const missingMappings = sceneIds.filter((id) => !mappedSceneIds.includes(id));
  const staleMappings = mappedSceneIds.filter((id) => !sceneIds.includes(id));
  assert(!missingMappings.length, `scenes without media mapping: ${missingMappings.join(', ')}`);
  assert(!staleMappings.length, `unknown scene mappings: ${staleMappings.join(', ')}`);
}

vm.runInContext(mediaSource, sandbox, { filename: 'v11-media.js' });
assert(typeof sandbox.pools === 'function', 'runtime media pool selector is not exported');
if (typeof sandbox.pools === 'function') {
  const englishMedia = new Set();
  const japaneseMedia = new Set();
  for (const item of ITEMS) {
    const englishPool = sandbox.pools(item, 'en');
    const japanesePool = sandbox.pools(item, 'jp');
    assert(englishPool.length > 0, `expression ${item.id} has no English media candidate`);
    assert(japanesePool.length > 0, `expression ${item.id} has no Japanese media candidate`);
    englishPool.forEach((url) => englishMedia.add(url));
    japanesePool.forEach((url) => japaneseMedia.add(url));
  }
  const sharedMedia = [...englishMedia].filter((url) => japaneseMedia.has(url));
  assert(!sharedMedia.length, `English and Japanese pools share ${sharedMedia.length} media urls`);
}

const words = new Set();
for (const item of ITEMS) {
  for (const word of item.en.toLocaleLowerCase().match(/[a-z']+/g) || []) words.add(word);
}

const report = {
  status: errors.length ? 'failed' : 'passed',
  cacheVersion: cacheVersions[0] || null,
  scenes: SCENES.length,
  expressions: ITEMS.length,
  dialogueTurns: Object.values(DIALOGUES).reduce((total, turns) => total + turns.length, 0),
  englishWordForms: words.size,
  communicationFunctions: new Set(ITEMS.map((item) => item.func)).size,
  duplicateEnglishLines: duplicateEnglish.length,
  duplicateJapaneseLines: duplicateJapanese.length,
  englishVideoCandidates: sandbox.TALKLOOP_MEDIA_SOURCES?.englishVideos || 0,
  japaneseVideoCandidates: sandbox.TALKLOOP_MEDIA_SOURCES?.japaneseInteractionVideos || 0,
  japaneseSceneFamilies: sandbox.TALKLOOP_MEDIA_SOURCES?.japaneseSceneFamilies || 0,
  errors,
  warnings,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
