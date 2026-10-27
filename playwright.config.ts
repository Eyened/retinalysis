import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 4,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173/retinalysis/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [{
    command: "npm run serve -- --port 4173 --no-open",
    url: "http://127.0.0.1:4173/retinalysis/",
    reuseExistingServer: !process.env.CI,
  }, {
    command: "node node_modules/@docusaurus/core/bin/docusaurus.mjs start tests/fixtures/model-card --port 4174 --host 127.0.0.1 --no-open",
    // This fixture shares node_modules with the real site. Docusaurus uses
    // the same persistent cache name for both, so keep fixture caching in memory.
    env: { DOCUSAURUS_NO_PERSISTENT_CACHE: "true" },
    url: "http://127.0.0.1:4174/retinalysis/",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  }],
});
