# retinalysis-registration

Easy, robust registration of retinal fundus images using classical computer vision: keypoint detection and SIFT matching. No GPU is required, and dependencies are lightweight (OpenCV, scikit-image, and related scientific Python packages).

The method achieves state-of-the-art performance on the FIRE dataset; see the [FIRE evaluation notebook](https://github.com/Eyened/retinalysis-registration/blob/master/FIRE%20-%20evaluation.ipynb) for details.

## Installation

```bash
pip install retinalysis-registration
```

## Dependencies

This package depends on [retinalysis-fundusprep](https://github.com/Eyened/retinalysis-fundusprep) (>=1.1.0) for fundus bounds detection and cropping.

## Usage

See the [Example notebook](https://github.com/Eyened/retinalysis-registration/blob/master/Example.ipynb) for a minimal walkthrough.

## Reference

Abstract presented at ARVO 2026: [Investigative Ophthalmology & Visual Science](https://iovs.arvojournals.org/article.aspx?articleid=2816108).

## Learned vessel registration (optional)

`VesselRegistration` adds a separate model-based flow; the existing `Registration`
interface and classical algorithm are unchanged. It registers soft vessel
probabilities and supports independent FoV ranges, segmentation models and
optional fovea coordinates for each input.

```python
from rtnls_registration import VesselRegistration

register = VesselRegistration(cache_dir="cache/vessels")
result = register(image0, image1)
if result.success:
    aligned = result.transform.warp(image0, out_size=image1.shape[:2])
```

Live inference requires the optional `vessels` dependencies and a local
SegmentAnyVessel release. Registration from cached probabilities needs no GPU or
Torch. See the [flow documentation](docs/vessel_registration.md) for setup,
coordinate conventions, configuration and limitations, and the
[FIRE vessel evaluation notebook](FIRE%20-%20vessel%20evaluation.ipynb) for an
end-to-end benchmark against the classical flow. The new flow currently uses
projective geometry; it does not include the classical flow's quadratic
refinement. FIRE performance is reported separately for development and held-out
cases.

The current grouped held-out FIRE AUC is **0.720** for the new flow versus
**0.906** for the classical flow; it is an experimental alternative, not a
replacement for the existing algorithm. See the [benchmark report](experiments/README.md).
