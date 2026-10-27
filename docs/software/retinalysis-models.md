---
title: retinalysis-models
slug: /software/retinalysis-models
sidebar_position: 3
---

## Purpose

Retinalysis models provides a shared training framework for retinal imaging research. It supports segmentation, classification, regression and keypoint localisation, with configuration files connecting data, transformations, model components and training settings.

### Inputs

Training data, task-specific targets, model components and experiment configurations.

### Outputs

Trained checkpoints, evaluation outputs and model releases for inference.

## Capabilities

- **Reusable training workflows:** configure data loading, augmentation, optimization and checkpointing together.
- **Project-specific components:** extend datasets, transforms and model modules to match a new research task.
- **Model release:** package trained models and ensembles for downstream inference.
- **Traceable evaluation:** use named metrics and experiment outputs to inspect a training run.

## Relationship to inference

The training package works alongside [retinalysis-inference](/software/retinalysis-inference), which handles model releases and prediction workflows. This separation helps researchers reuse trained models without rebuilding the training experiment.

The framework remains under development. Its available tasks are capabilities of the software, not a claim that every model trained with it has been validated. Dataset choice, evaluation design and performance remain responsibilities of each model study.

[retinalysis-inference](/software/retinalysis-inference)
