import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import objectDetector from '@cloud-annotations/object-detection';
import './main.scss';

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const filePickerRef = useRef();
  const canvasRef = useRef();

  const [image, setImage] = useState('');
  const [status, setStatus] = useState('Click anywhere to begin');
  const [results, setResults] = useState([]);
  const isLoading = status === 'Loading...';

  const handleImageChange = useCallback(({target: {files: [selectedFile]}}) => {
    if (!selectedFile) {
      return;
    }
    reader.readAsDataURL(selectedFile);
  }, [reader]);

  useEffect(() => {
    reader.addEventListener('load', async ({target: {result: src}}) => {
      setImage(src);
      clearCanvas(canvasRef.current);

      setStatus('Loading...');
      setResults([]);

      const results = await detectObjectsInImage(imageRef.current);
      console.log(results);

      if (results.length > 0) {
        setStatus('Click anywhere to go again');
        drawResultBoxes(canvasRef.current, results);
        setResults(results);
      } else {
        setStatus('No components detected. Please try again or check the console for the raw output.');
      }
    });
  }, [reader]);

  const openFilePicker = useCallback(() => {
    if (isLoading) {
      return;
    }
    filePickerRef.current.click();
  }, [isLoading]);

  const resultStatusClassName = `result-status container ${isLoading ? 'result-status--loading' : ''}`;

  return (
    <main className="page-wrapper">
      <section className="intro">
        <p className="container">
          This <a href="https://github.com/kvendrik/polaris-ml" target="_blank" rel="noopener noreferrer">experiment</a> allows you to upload a <a href="https://github.com/kvendrik/polaris-ml/tree/master/training-data" target="_blank" rel="noopener noreferrer">wireframe you sketched out</a> on a whiteboard and will tell you what <a href="https://polaris.shopify.com/components" target="_blank" rel="noopener noreferrer">Polaris components</a> you drew.
        </p>
      </section>
      <section className={resultStatusClassName} onClick={openFilePicker}>
        <p>{status}</p>
        <div className="image-container">
          <canvas className="image-container__canvas" ref={canvasRef} width="600" height="500" />
          <img src={image} ref={imageRef} alt="" width="600" height="500" />
        </div>
        <input className="file-picker" ref={filePickerRef} type="file" onChange={handleImageChange} />
      </section>
    </main>
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
