---
title: Color fundus imaging
slug: /models/color-fundus
sidebar_position: 0
---

:::info[Important]

The entire VascX pipeline, including feature extraction, is available in [retinalysis-vascx](/software/retinalysis-vascx). A preprint presenting the pipeline is [available here](https://arxiv.org/abs/2602.08580).

:::

## VascX models

This section contains the model cards for the VascX models from the paper [VascX Models: Deep Ensembles for Retinal Vascular Analysis From Color Fundus Images](https://tvst.arvojournals.org/article.aspx?articleid=2810436).

For inference and the complete analysis pipeline, use [retinalysis-vascx](/software/retinalysis-vascx).

The model weights are in [Hugging Face](https://huggingface.co/Eyened/vascx).

<div style="max-width: 66%; margin: 0 auto;">

![Nine color fundus images from the HRF dataset overlaid with model outputs: arteries in red, veins in blue, the optic disc as a white region and the fovea as a white cross.](/img/vascx-models-hrf.webp)

</div>

VascX model outputs on images from the HRF dataset: artery–vein segmentation (red and blue), optic disc segmentation (white) and fovea localisation (cross). [Eyened/vascx model repository](https://huggingface.co/Eyened/vascx)

## Model cards

Please see the model card for each model for details about its training procedure, datasets and citations:

- **Artery-vein** segmentation:
    - [Original version (july24)](/models/color-fundus/av-segmentation#original-version-july24)
    - [Updated version (may26)](/models/color-fundus/av-segmentation#updated-version-may26)
- **Optic disc** segmentation:
    - [Original version (july24)](/models/color-fundus/od-segmentation#original-version-july24)
    - [Updated version (may26)](/models/color-fundus/od-segmentation#updated-version-may26)
- **Fovea localisation**:
    - [Original version (july24)](/models/color-fundus/fovea-localisation#original-version-july24)
    - [Updated version (may26)](/models/color-fundus/fovea-localisation#updated-version-may26)
- **Quality estimation**:
    - [Original version (july24)](/models/color-fundus/quality-estimation)
- **Vessel** segmentation:
    - [Original version (july24)](/models/color-fundus/vessel-segmentation#original-version-july24)
    - [Updated version (may26)](/models/color-fundus/vessel-segmentation#updated-version-may26)

:::info[Important]

VascX models were trained using datasets kindly made available by the ophthalmic community. The model cards above indicate which (publicly-available) datasets were used for training. We encourage VascX users to consider citing the source datasets when they are relevant to their work.

:::

## Licensing

We share the models under a Creative Commons Attribution–NonCommercial 4.0 license. We note that some of the datasets used for training and evaluating the model ensembles were made publicly available for research purposes only. We encourage due diligence for any applications with potential for commercial use.
