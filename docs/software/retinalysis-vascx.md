---
title: retinalysis-vascx
slug: /software/retinalysis-vascx
sidebar_position: 1
---

- [Documentation](https://github.com/Eyened/retinalysis-vascx#readme)
- [Source code](https://github.com/Eyened/retinalysis-vascx)
- [Try the VascX app](https://eyened.github.io/retinalysis-vascx-app/)

## Purpose

VascX helps researchers extract vascular biomarkers from color fundus images. Its workflow connects image segmentation to measurements that can be visualized on the retina, making it possible to inspect how a number was obtained.

### Inputs

Color fundus images, vascular segmentations and anatomical landmarks.

### Outputs

Vascular measurements and visualizations of their anatomical context.

![Six fundus images with annotated vessel calibers and concentric measurement regions.](/img/vascx-caliber.webp)

VascX caliber measurements, shown on the vessels and retinal regions used for analysis. [VascX project · documentation figure](https://github.com/Eyened/retinalysis-vascx)

## Measurements

- **Vessel caliber and central retinal equivalents:** summarize vessel width using configurable measurement definitions.
- **Tortuosity and bifurcations:** describe vessel paths and branching geometry.
- **Vascular density and sparsity:** characterize how the vasculature occupies a retinal region.
- **Anatomical regions:** locate measurements relative to the optic disc and fovea. Measurements can be omitted when the required region is not visible.

![Six retinal examples with vessel tortuosity measurements overlaid.](/img/vascx-tortuosity.webp)

Vessel tortuosity visualized on the source images. [VascX project · documentation figure](https://github.com/Eyened/retinalysis-vascx)

## Interpretation and limitations

The package offers multiple definitions for several biomarkers. A study should specify its measurement settings and check both the input segmentation and the visible retinal region. A visualization supports inspection; it does not by itself establish accuracy for a new population or acquisition device.

### [An explainable software toolbox for retinal vascular biomarkers](https://arxiv.org/abs/2602.08580)

The software preprint describes the biomarker toolbox and its measurement definitions.

### [VascX Models: Deep Ensembles for Retinal Vascular Analysis](https://tvst.arvojournals.org/article.aspx?articleid=2810436)

The 2025 model paper concerns the ensembles evaluated in that publication. Its results should not be assumed to validate every subsequent model release.
