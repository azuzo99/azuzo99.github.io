// Loads src/data/{stack,trusted,contact,site}.ts without the image imports (icons.ts pulls PNG/SVG assets Playwright
// cannot parse). Each module is transpiled with TypeScript; './icons' becomes a Proxy stub, sibling modules resolve here.
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/data');
const cache = new Map<string, any>();

const stub = new Proxy({}, { get: (_, k) => ({ name: String(k), icon: null, mono: '', logo: null }) });

function load(name: string): any {
  if (name === 'icons') return { I: stub, img: stub };
  if (cache.has(name)) return cache.get(name);
  const src = readFileSync(path.join(root, `${name}.ts`), 'utf8');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} as any };
  cache.set(name, m.exports);
  new Function('module', 'exports', 'require', js)(m, m.exports, (spec: string) => {
    if (spec === 'astro') return {};
    return load(spec.replace(/^\.\//, ''));
  });
  return m.exports;
}

export const stackData = load('stack') as typeof import('../../src/data/stack');
export const trustedData = load('trusted') as typeof import('../../src/data/trusted');
export const contactData = load('contact') as typeof import('../../src/data/contact');
