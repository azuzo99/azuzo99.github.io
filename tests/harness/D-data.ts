// Loads src/data/work.ts inside Playwright's node runner. The module imports image assets
// (webp/png/svg) that the test loader cannot parse, so transpile it and stub those imports.
import { readFileSync } from 'node:fs';
import ts from 'typescript';

type Work = typeof import('../../src/data/work');

const stub: any = new Proxy(function () {}, {
  get: (_t, k) => (k === Symbol.toPrimitive ? () => 'asset' : stub),
  apply: () => stub,
});

function load(): Work {
  const file = new URL('../../src/data/work.ts', import.meta.url);
  const out = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod: { exports: any } = { exports: {} };
  new Function('module', 'exports', 'require', out)(mod, mod.exports, () => ({ I: stub, img: stub, default: stub }));
  return mod.exports as Work;
}

export const work = load();
