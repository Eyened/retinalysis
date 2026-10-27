---
title: Software
slug: /software
sidebar_position: 0
sidebar_label: Software overview
---

Choose the step in your workflow. VascX turns segmentations into vascular measurements; registration aligns images; models supports development; inference runs model releases.

- [retinalysis-vascx](/software/retinalysis-vascx) — Vascular biomarker measurements and visualizations.
- [retinalysis-registration](/software/retinalysis-registration) — Spatial registration of retinal images.
- [retinalysis-models](/software/retinalysis-models) — Training, evaluation and release of retinal deep learning models.
- [retinalysis-inference](/software/retinalysis-inference) — Preprocessing and prediction using model releases.

## How the packages fit together

Training produces a model release. Inference applies that release to images. VascX uses retinal segmentations and landmarks to measure vascular structure. Registration provides a separate way to align images and transfer spatial information.

The package pages introduce these roles. Follow their documentation for installation, APIs and reproducible examples.
