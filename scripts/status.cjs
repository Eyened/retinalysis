const { load, status } = require("./catalog.cjs");
const data = load();
const rows = status(data);
if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2));
else {
  console.log(
    "Read-only content status. Select page IDs explicitly before asking the AI to update.\n",
  );
  for (const row of rows)
    console.log(
      `${row.id}: ${row.reasons.join("; ") || "UNCHANGED"}${row.external_review ? " [publication URLs require manual recheck]" : ""}`,
    );
  console.log(
    "\nNo files changed. Missing local sources do not unpublish existing pages.",
  );
}
