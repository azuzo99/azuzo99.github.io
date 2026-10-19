import { defineConfig } from '@playwright/test';

// Design reference snapshots only (design.md §10). Serves the read-only design folder.
export default defineConfig({
  testDir: 'tests/snapshot',
  testMatch: '*.snapshot.ts',
  timeout: 90_000,
  workers: 2,
  use: { baseURL: 'http://localhost:4400' },
  webServer: {
    command: 'npx serve ../_source/design -l 4400 --no-clipboard',
    url: 'http://localhost:4400/Adam%20Zuzo%20Profile%20v4.dc.html',
    reuseExistingServer: true,
  },
});
