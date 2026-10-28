import { defineConfig } from '@playwright/test';
import { VIEWPORTS, type ViewportName } from './tests/harness/viewports';

// PORT lets each solver worktree run its own server.
const PORT = Number(process.env.PORT ?? 4321);

const touch = (vp: ViewportName) => vp === 'phone' || vp === 'mid';

// Site tests (design.md §10). `serve` serves dist/, so build first (npm run build).
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: (Object.keys(VIEWPORTS) as ViewportName[]).map((vp) => ({
    name: vp,
    use: { viewport: VIEWPORTS[vp], hasTouch: touch(vp), isMobile: vp === 'phone' },
  })),
  webServer: {
    command: `npx serve dist -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
  },
});
