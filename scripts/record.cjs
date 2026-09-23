// Records reviewed content only. It does not generate pages or alter other records.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const {
  load,
  hash,
  fingerprint,
  sourcePaths,
  dependencyFingerprint,
} = require("./catalog.cjs");
const ids = process.argv.slice(2);
if (!ids.length || ids.some((id) => id.startsWith("-")))
  throw new Error(
    "Pass explicit reviewed page IDs: npm run content:record -- retinalysis-vascx",
  );
const data = load();
for (const id of ids) {
  const p = data.blueprint.pages.find((p) => p.id === id);
  if (!p || p.status === "draft")
    throw new Error(`Not a published/placeholder page: ${id}`);
  const prior = data.provenance.pages[id];
  if (!prior)
    throw new Error(
      `Create the evidence record for ${id} in provenance.json first.`,
    );
  const records = sourcePaths(p, data).map((source) => {
    const file = path.resolve(data.dir, source);
    if (!fs.existsSync(file))
      throw new Error(`Cannot record unavailable source: ${source}`);
    let revision = null,
      dirty = null;
    try {
      revision = execFileSync(
        "git",
        ["-C", path.dirname(file), "rev-parse", "HEAD"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim();
      dirty = Boolean(
        execFileSync(
          "git",
          [
            "-C",
            path.dirname(file),
            "status",
            "--porcelain",
            "--",
            path.basename(file),
          ],
          { encoding: "utf8" },
        ).trim(),
      );
    } catch {}
    return {
      path: source,
      sha256: hash(fs.readFileSync(file)),
      revision,
      dirty,
    };
  });
  data.provenance.pages[id] = {
    ...prior,
    reviewed_at: new Date().toISOString().slice(0, 10),
    blueprint_sha256: fingerprint(p),
    content_sha256: hash(fs.readFileSync(path.join(data.dir, p.page_file))),
    dependencies_sha256: dependencyFingerprint(p, data),
    source_files: records,
  };
}
fs.writeFileSync(
  path.join(data.dir, "provenance.json"),
  JSON.stringify(data.provenance, null, 2) + "\n",
);
console.log(`Recorded reviewed content for: ${ids.join(", ")}`);
