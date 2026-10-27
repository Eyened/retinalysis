---
library_name: fixture-library
library_version: 1.0
---

# Card title

## Description

This is a deliberately long description used only to exercise the renderer. It contains **bold text**, a [reference link](https://example.test/reference), and enough prose to exceed the compact preview limit. Expanding the description should reveal the original Markdown formatting without replacing it with plain text. The final sentence is deliberately outside the short preview so a browser test can distinguish the expanded content from the preview.

### Inputs

Nested inputs belong to the description and expand with it.

## Evaluation

| Dataset | Score |
| --- | --- |
| Rendering fixture | 0.5 |

## Images

![Fixture diagram](./sample.svg)

[![Linked fixture diagram](./sample.svg)](https://example.test/image)

## Inference

1. Install the inference package.

   ```sh
   pip install example-inference
   ```

2. Load the model and prepare the image. This deliberately detailed list item explains the setup as part of the whole inference procedure. It should never receive a separate expansion control, even though this item alone is long enough to have triggered the old paragraph-based truncation behavior.

   ```python
   from example_inference import Model
   model = Model.load("fixture-model")
   image = load_image("example.png")
   prediction = model.predict(image)
   save_prediction(prediction)
   ```

### Output

The output stays in the same expandable inference section.

## Long list

- The first point has a detailed explanation about the example. It provides enough background to check that a list item is never shortened independently. Every sentence belongs with the rest of this point and must remain intact when the section expands, including this final sentence beyond the old limit.
- The second point also has a detailed explanation. Its purpose is to confirm that the single section control reveals both items at once, with the list numbering and nested formatting preserved. There should be no independent disclosure embedded inside either list item, regardless of its length.

## Limitations
