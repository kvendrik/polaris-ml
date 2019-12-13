import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import objectDetector from '@cloud-annotations/object-detection';
import Prototype from './Prototype';
import './main.scss';

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const filePickerRef = useRef();
  const canvasRef = useRef();

  const [image, setImage] = useState('');
  const [status, setStatus] = useState('Upload a wireframe drawing');
  const [results, setResults] = useState([]);
  const isLoading = status === 'Loading...';

  const canvasSizes = useMemo(() => {
    const canvasWidth = (window.innerWidth < 600 ? window.innerWidth : 600) - (3*16);
    return {
      width: canvasWidth,
      height: canvasWidth - 100,
    };
  }, [window.innerWidth]);

  const handleImageChange = useCallback(({target: {files: [selectedFile]}}) => {
    if (!selectedFile) {
      return;
    }
    reader.readAsDataURL(selectedFile);
  }, [reader]);

  useEffect(
    () => reader.addEventListener('load', ({target: {result: src}}) => detectOnImagePath(src)),
    [reader]
  );

  const handleShowExampleClick = useCallback(() => detectOnImagePath('wireframe-example.jpg'), []);

  const openFilePicker = useCallback(() => {
    if (isLoading) {
      return;
    }
    filePickerRef.current.click();
  }, [isLoading]);

  const detectOnImagePath = useCallback(async (src) => {
    if (isLoading) {
      return;
    }

    setImage(src);
    clearCanvas(canvasRef.current);

    setStatus('Loading...');
    setResults([]);

    const results = await detectObjectsInImage(imageRef.current);
    console.log(results);

    if (results.length > 0) {
      setStatus('Upload a wireframe drawing');
      drawResultBoxes(canvasRef.current, results);
      setResults(results);
    } else {
      setStatus('No components detected. Please try again or check the console for the raw output.');
    }
  }, [isLoading, canvasRef, imageRef]);

  const componentNames = results.map(({class: label}) => label);
  console.log(componentNames);

  return (
    <>
      <main className="control-board">
        <p className="intro container">
          This <a href="https://github.com/kvendrik/polaris-whiteboarder" target="_blank" rel="noopener noreferrer">experiment</a> creates simple <a href="https://polaris.shopify.com" target="_blank" rel="noopener noreferrer">Polaris</a> prototypes from <a href="https://github.com/kvendrik/polaris-ml/tree/master/training-data" target="_blank" rel="noopener noreferrer">wireframes drawn on a whiteboard</a>.
        </p>
        <section className="result-status container">
          <p>
            <button className="status" onClick={openFilePicker}>{status}</button>
            <br />
            <small>Don't feel like drawing? <button onClick={handleShowExampleClick}>View an example</button></small>
          </p>
          <div className="image-container">
            <canvas className="image-container__canvas" ref={canvasRef} width={canvasSizes.width} height={canvasSizes.height} />
            <img src={image} ref={imageRef} alt="" width={canvasSizes.width} height={canvasSizes.height} />
          </div>
          <input className="file-picker" ref={filePickerRef} type="file" onChange={handleImageChange} />
        </section>
      </main>
      {results.length > 0 && (
        <>
          <hr />
          <Prototype components={componentNames} />
        </>
      )}
    </>
  );
}

async function detectObjectsInImage(imageNode) {
  const model = await objectDetector.load('model');
  return model.detect(imageNode);
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawResultBoxes(canvas, results) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const font = '14px Open Sans';
  const textHeight = parseInt(font, 10);

  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.strokeStyle = '#2da15f';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#2da15f';

  for (const {class: label, score, bbox: [x, y, width, height]} of results) {
    ctx.strokeRect(x, y, width, height);
    const textWidth = ctx.measureText(constructLabel(label, score)).width;
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  }

  for (const {class: label, score, bbox: [x, y]} of results) {
    ctx.fillStyle = '#000000';
    ctx.fillText(constructLabel(label, score), x, y);
  }

  function constructLabel(classLabel, score) {
    return `${classLabel} (${Math.round(score*100)}%)`;
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
