const { load, validate } = require("./catalog.cjs");
const errors = validate(load());
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "Content validated: catalogue, routes, placeholders, provenance and figures.",
);
