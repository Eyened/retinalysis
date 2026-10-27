---
title: retinalysis-registration
slug: /software/retinalysis-registration
sidebar_position: 2
---

- [Documentation](https://github.com/Eyened/retinalysis-registration#readme)
- [Source code](https://github.com/Eyened/retinalysis-registration)
- [Example notebook](https://github.com/Eyened/retinalysis-registration/blob/master/Example.ipynb)

## Image registration

Retinalysis registration estimates a spatial transformation between retinal images. This makes it useful when a study needs to align photographs or transfer image coordinates and annotations into a shared frame.

### Inputs

A reference image and a target image, with optional spatial annotations.

### Outputs

A transformation that can be applied to images, masks and point coordinates.

![Red and blue retinal image overlay after registration, with aligned vascular structures.](/img/registration-overlay.webp)

Two retinal images aligned by registration. The red–blue overlay makes correspondence and residual differences visible. [Retinalysis registration · Example notebook](https://github.com/Eyened/retinalysis-registration/blob/master/Example.ipynb)

## Method

The method enhances vascular structure, detects and matches SIFT features, and estimates an image transformation. The implementation supports projective alignment with optional quadratic refinement. The example notebook demonstrates transforming a fundus image, a mask and point coordinates.

## Modalities and evidence

The documented example uses color fundus images. The implementation also includes a dedicated OCT angiography preprocessing path. That implementation capability is distinct from validation of a particular OCTA dataset or cross-modality pairing; these should be assessed for the intended study.

The repository includes a [FIRE evaluation notebook](https://github.com/Eyened/retinalysis-registration/blob/master/FIRE%20-%20evaluation.ipynb). Inspect its experimental setup and results before applying benchmark conclusions to a new dataset.

### [Registration research abstract · IOVS](https://iovs.arvojournals.org/article.aspx?articleid=2816108)

Publication linked by the package authors. The package documentation and example notebook provide the practical starting point.
