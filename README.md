# Polaris Whiteboarder

This experiment creates simple Polaris prototypes from wireframes drawn on a whiteboard. It has many flaws but was fun to work on.

[See it in action](https://kvendrik.github.io/polaris-whiteboarder)

<img src="preview.jpg" width="100%" />

## How it works

1. [Training data](https://github.com/kvendrik/polaris-ml/tree/master/training-data) is uploaded to [IBM Cloud Annotations](https://cloud.annotations.ai) and labeled so the machine knows what components are visible in the images.
2. We use a [Watson Machine Learning](https://dataplatform.cloud.ibm.com/docs/content/wsj/analyze-data/ml-overview.html) instance to train a model using this training data.
3. We download this [newly trained model](https://github.com/kvendrik/polaris-ml/tree/master/public/model) and store it with the front-end (this repository).
4. The front-end then uses [Tensorflow.js](https://www.tensorflow.org/js) to (client-side) [detect](https://github.com/kvendrik/polaris-whiteboarder/blob/master/src/object-detector.js) prototype-friendly [Polaris](https://polaris.shopify.com/) components in a given image (utility code is highly derived from [IBM's object detection library](https://github.com/cloud-annotations/object-detection-js)).

This flow is based on [IBM's object detection walkthrough](https://cloud-annotations.github.io/training/object-detection/cli/index.html).
