---
library_name:
library_version:
---

## Model description
UNet ensemble (5 models) for artery-vein segmentation from color fundus images (CFIs), trained on various public datasets, and on images from the Rotterdam Study. 

## Intended uses

Robust artery-vein segmentation on color fundus images.

## Training data

The model was trained on [HRF-AV](https://www.sciencedirect.com/science/article/pii/S1361841521003856), [Les-AV](https://link.springer.com/chapter/10.1007/978-3-030-00934-2_8), [RITE](https://ieeexplore.ieee.org/document/6627847), [Leuven-Haifa](https://www.nature.com/articles/s41597-024-03086-6), [REYIA](https://arxiv.org/html/2503.01190v1#S3) and on images from the Rotterdam Study.

## Training procedure

See [VascX Models: Deep Ensembles for Retinal Vascular Analysis From Color Fundus Images](https://tvst.arvojournals.org/article.aspx?articleid=2810436). This model has the same architecture and training procedure, but we added additional training data from [REYIA](https://arxiv.org/html/2503.01190v1#S3) (publicly available), and from the Rotterdam Study.

## Evaluation

See [VascX Models: Deep Ensembles for Retinal Vascular Analysis From Color Fundus Images](https://tvst.arvojournals.org/article.aspx?articleid=2810436)

Notes:
- The model was trained and evaluated using CFIs cropped to a square using [retinalysis-fundusprep].

## Limitations

- Mistakes in A/V classification
- Not trained on WF or UWF fundus images

## Inference

We recommend to run inference using [retinalysis-inference](https://github.com/Eyened/retinalysis-inference), which can auto-download the model weights and execute CFI pre-processing (crop to square) if necessary. For running inference on a CFI:

1. Install `retinalysis-inference`:
    ```
    pip install retinalysis-inference
    ```

2. Load the ensemble:
    ```
    from rtnls_inference import (
        HeatmapRegressionEnsemble,
        SegmentationEnsemble,
    )
    ensemble = SegmentationEnsemble.from_huggingface("Eyened/vascx:artery_vein/av_may26.pt").to(device)
    ```

3. Run inference:
    ```
    # 1. Preprocess one input record.
    image = np.array(Image.open("/PATH/TO/RGB/FUNDUS/IMAGE.PNG"))
    item = ensemble.preprocess_item({"image": image})

    # 2. Make a batch of size 1.
    batch = ensemble.make_batch([item])

    # 3. Run the ensemble.
    predictions = ensemble.predict_batch(batch)

    # 4. Postprocess the prediction into a final mask.
    result = ensemble.postprocess_batch(predictions, batch)[0]
    ```

For more information see [retinalysis-inference](https://github.com/Eyened/retinalysis-inference).

## License & citation

If you use this model, please consider citing, based on relevance:

- [VascX Models: Deep Ensembles for Retinal Vascular Analysis From Color Fundus Images](https://tvst.arvojournals.org/article.aspx?articleid=2810436)

    Vargas Quiros, J. D., Liefers, B., van Garderen, K. A., Vermeulen, J. P., & Klaver, C. C. W. (2025). VascX Models: Deep Ensembles for Retinal Vascular Analysis From Color Fundus Images. Translational Vision Science & Technology, 14(7), 19-19.

- [retinalysis-vascx: An explainable software toolbox for the extraction of retinal vascular biomarkers](https://arxiv.org/abs/2602.08580)

    Vargas Quiros, J. V., Beyeler, M. J., Vela, S. O., Center, E. R., Bergmann, S., Klaver, C. C. W., & Liefers, B. (2026). retinalysis-vascx: An explainable software toolbox for the extraction of retinal vascular biomarkers. arXiv preprint arXiv:2602.08580.

- The [Leuven-Haifa dataset](https://www.nature.com/articles/s41597-024-03086-6) and [REYIA](https://arxiv.org/html/2503.01190v1#S3) datasets together are a large part of the training data for this model, and we encourage users to consider citing them separately:

    Van Eijgen J, Fhima J, Billen Moulin-Romsée MI, Behar JA, Christinaki E, Stalmans I. Leuven-haifa high-resolution fundus image dataset for retinal blood vessel segmentation and glaucoma diagnosis. Scientific data. 2024 Feb 29;11(1):257.

    Fhima J, Van Eijgen J, Beeckmans L, Jacobs T, Freiman M, Nakayama LF, Stalmans I, Baskin C, Behar JA. Enhancing retinal vessel segmentation generalization via layout-aware generative modelling. Machine Learning: Health. 2025 Mar.


We share the model under a Creative Commons Attribution–NonCommercial 4.0 license. We note that some of the datasets used for training and evaluating the model ensemble were made publicly available for research purposes, but do not include a license. Other such as [Leuven-Haifa](https://www.nature.com/articles/s41597-024-03086-6) explicitly use custom terms with non-commercial clauses. 