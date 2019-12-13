import * as tf from '@tensorflow/tfjs';

export default async function imageObjectDetector(modelPath) {
  const graph = await tf.loadGraphModel(`${modelPath}/model.json`);
  const labels = await fetch(`${modelPath}/labels.json`).then(data => data.json());
  return async imageNode => await detectOnImage(graph, labels, imageNode);
}

async function detectOnImage(graph, labels, imageNode) {
  const batched = tf.tidy(() => {
    const img = tf.browser.fromPixels(imageNode);
    return img.expandDims(0);
  });

  const {shape: [_, height, width]} = batched;
  const result = await graph.executeAsync(batched);
  const [scoresTensor, boxesTensor] = result;

  const scores = scoresTensor.dataSync();
  const boxes = boxesTensor.dataSync();

  batched.dispose();
  tf.dispose(result);

  const [maxScores, classes] = calculateMaxScores(
    scores,
    scoresTensor.shape[1],
    scoresTensor.shape[2]
  );

  const prevBackend = tf.getBackend();
  tf.setBackend('cpu');

  const indexTensor = tf.tidy(() =>
    tf.image.nonMaxSuppression(
      tf.tensor2d(
        boxes,
        [boxesTensor.shape[1], boxesTensor.shape[3]]
      ),
      maxScores,
      20,
      0.5,
      0.5
    ),
  );

  const indexes = indexTensor.dataSync();
  indexTensor.dispose();

  tf.setBackend(prevBackend);

  return [...indexes].map((index) => ({
    boundingBox: buildBoundingBoxForResult(index, width, height, boxes),
    class: labels[Math.round(classes[index])],
    score: maxScores[index],
  }));
}

function calculateMaxScores(scores, numberOfBoxes, numberOfClasses) {
  const maxes = [];
  const classes = [];

  for (let i = 0; i < numberOfBoxes; i++) {
    let max = Number.MIN_VALUE;
    let index = -1;
    for (let j = 0; j < numberOfClasses; j++) {
      if (scores[i * numberOfClasses + j] > max) {
        max = scores[i * numberOfClasses + j];
        index = j;
      }
    }
    maxes[i] = max;
    classes[i] = index;
  }

  return [maxes, classes];
}

function buildBoundingBoxForResult(
  index,
  width,
  height,
  boxes,
) {
  const boundingBox = [];

  for (let i = 0; i < 4; i++) {
    boundingBox[i] = boxes[index * 4 + i];
  }

  const minY = boundingBox[0] * height;
  const minX = boundingBox[1] * width;
  const maxY = boundingBox[2] * height;
  const maxX = boundingBox[3] * width;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
