const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

function syncModelCards(root = path.resolve(__dirname, "..")) {
  root = path.resolve(root);
  let sourceConfig;
  try {
    sourceConfig = fs.readFileSync(path.join(root, "model-cards.yaml"), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("Copy model-cards.example.yaml to model-cards.yaml and configure source paths before running models:sync.", { cause: error });
    }
    throw error;
  }
  const config = YAML.parse(sourceConfig);
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("model-cards.yaml must map asset filenames to absolute source paths.");
  }
  const assetDir = path.join(root, "docs/model_cards");
  const copies = [];
  // Check every source and destination before modifying any copied asset.
  for (const [name, source] of Object.entries(config)) {
    if (!/^[a-zA-Z0-9][\w-]*(?:\/[a-zA-Z0-9][\w-]*)*\.md$/.test(name)) {
      throw new Error(`Invalid model-card asset filename: ${name}`);
    }
    if (typeof source !== "string" || !path.isAbsolute(source)) {
      throw new Error(`Model-card source must be an absolute path: ${name}`);
    }
    const destination = path.join(assetDir, name);
    // Do not follow links out of the managed asset folder.
    for (let current = destination; current !== root; current = path.dirname(current)) {
      const stat = fs.lstatSync(current, { throwIfNoEntry: false });
      if (!stat) continue;
      if (stat.isSymbolicLink()) throw new Error(`Symlink in asset destination: ${current}`);
      if (current !== destination && !stat.isDirectory()) {
        throw new Error(`Asset parent is not a directory: ${current}`);
      }
      if (current === destination && !stat.isFile()) {
        throw new Error(`Asset destination is not a file: ${current}`);
      }
    }
    let bytes;
    try {
      bytes = fs.readFileSync(source);
    } catch (error) {
      throw new Error(`Cannot read model card for ${name}: ${source}`, { cause: error });
    }
    copies.push({ destination, bytes });
  }
  const written = [];
  for (const { destination, bytes } of copies) {
    if (fs.existsSync(destination) && fs.readFileSync(destination).equals(bytes)) continue;
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
    written.push(path.relative(root, destination));
  }
  // Removing a source from the configuration does not delete a still-imported
  // card or any handwritten document. Unused assets can be removed manually.
  return { configured: copies.length, written };
}

if (require.main === module) {
  try {
    const result = syncModelCards();
    console.log(`Model cards: ${result.configured} configured, ${result.written.length} copied.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { syncModelCards };
