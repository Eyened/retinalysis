---
title: Rotterdam artery–vein segmentation dataset
slug: /datasets/rav
sidebar_position: 1
---

- [Read the paper](https://arxiv.org/abs/2512.17322v2)
- [Access the dataset](https://dataverse.nl/dataset.xhtml?persistentId=doi:10.34894/9OIMWY)

## Dataset composition

RAV contains **206 color fundus images** with artery–vein annotations, drawn mainly from the Rotterdam Study, with contributions from MYST and AMD-Life. It includes varied cameras, image quality and retinal fields, rather than only ideal photographs. [Source: paper, v2](https://arxiv.org/abs/2512.17322v2).

![Nine fundus images from the RAV paper with artery and vein annotation overlays.](/img/rav-segmentations.webp)

Figure 2. Sample artery–vein segmentations from RAV. [Vargas Quiros et al. · RAV, arXiv:2512.17322v2](https://arxiv.org/abs/2512.17322v2)

## Annotation process

Graders separated vascular masks into arteries, veins and unknown vessels, corrected errors, and checked connectivity. Artery–vein crossings were labelled in both vessel masks. Images and segmentations are distributed at **1024 × 1024** resolution. [Annotation method](https://arxiv.org/abs/2512.17322v2).

![Histograms of imaging device, patient age, image quality, laterality, image centering and field of view.](/img/rav-characteristics.webp)

Figure 1. Characteristics of the 206 color fundus images in RAV. [Vargas Quiros et al. · RAV, arXiv:2512.17322v2](https://arxiv.org/abs/2512.17322v2)

## Annotation agreement

The paper reports inter-rater assessment by four graders on an independent set of image windows. Mean pairwise Dice was **0.906 (SD 0.078)** for arteries and **0.899 (SD 0.099)** for veins. These describe annotation agreement—not segmentation-model performance. [Technical validation, page 7](https://arxiv.org/abs/2512.17322v2).

## Access and use

The dataset is available through Dataverse under **CC BY-NC 4.0**. Review the repository’s terms and cite the paper when using it. [Dataset access](https://dataverse.nl/dataset.xhtml?persistentId=doi:10.34894/9OIMWY).

### [Rotterdam artery–vein segmentation (RAV) dataset](https://arxiv.org/abs/2512.17322v2)

Vargas Quiros and colleagues · arXiv preprint, version 2, February 2026.
