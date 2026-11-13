const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

// Copy the Markdown files listed in one local configuration into one asset folder.
function syncAssets(root, { configName, assetFolder, label, optional = false }) {
  root = path.resolve(root);
  let sourceConfig;
  try {
    sourceConfig = fs.readFileSync(path.join(root, configName), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      if (optional) return { configured: 0, written: [] };
      throw new Error(`Copy ${configName.replace(".yaml", ".example.yaml")} to ${configName} and configure source paths before running models:sync.`, { cause: error });
    }
    throw error;
  }
  const config = YAML.parse(sourceConfig);
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(`${configName} must map asset filenames to absolute source paths.`);
  }
  const assetDir = path.join(root, assetFolder);
  const copies = [];
  // Check every source and destination before modifying any copied asset.
  for (const [name, source] of Object.entries(config)) {
    if (!/^[a-zA-Z0-9][\w-]*(?:\/[a-zA-Z0-9][\w-]*)*\.md$/.test(name)) {
      throw new Error(`Invalid ${label} asset filename: ${name}`);
    }
    if (typeof source !== "string" || !path.isAbsolute(source)) {
      throw new Error(`${label[0].toUpperCase()}${label.slice(1)} source must be an absolute path: ${name}`);
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
      throw new Error(`Cannot read ${label.replace("-", " ")} for ${name}: ${source}`, { cause: error });
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

function syncModelCards(root = path.resolve(__dirname, "..")) {
  return syncAssets(root, { configName: "model-cards.yaml", assetFolder: "docs/model_cards", label: "model-card" });
}

// Repository READMEs shown as documents. The copied filename is the GitHub
// repository name, which scripts/readme-pages.cjs uses to resolve links.
function syncReadmes(root = path.resolve(__dirname, "..")) {
  return syncAssets(root, { configName: "readmes.yaml", assetFolder: "docs/_readmes", label: "README", optional: true });
}

if (require.main === module) {
  try {
    const cards = syncModelCards();
    console.log(`Model cards: ${cards.configured} configured, ${cards.written.length} copied.`);
    const readmes = syncReadmes();
    console.log(`READMEs: ${readmes.configured} configured, ${readmes.written.length} copied.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { syncModelCards, syncReadmes };
