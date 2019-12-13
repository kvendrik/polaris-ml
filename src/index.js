import React, {useCallback, useEffect, useMemo, useReducer, useRef} from 'react';
import ReactDOM from 'react-dom';
import imageObjectDetector from './object-detector';
import Prototype from './Prototype';
import './main.scss';

let detectOnImageFetch = imageObjectDetector('model');

function reducer(state, {type, payload}) {
  const {image} = state;

  switch(type) {
    case 'loading':
      if (image === payload.image) {
        return state;
      }
      return {loading: true, image: payload.image, results: [], status: 'Loading...'};
    case 'success':
      return {loading: false, image, results: payload.results, status: 'Upload a wireframe drawing'};
    case 'error':
      return {
        loading: false,
        image,
        results: [],
        status: 'No components detected. Please try again or check the console for the raw output.'
      };
  }
}

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const filePickerRef = useRef();
  const canvasRef = useRef();

  const [{loading, image, status, results}, dispatch] = useReducer(reducer, {
    loading: false,
    image: '',
    status: 'Upload a wireframe drawing',
    results: [],
  });

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
    () => {
      reader.addEventListener('load', ({target: {result: src}}) => handleSetImage(src));
      imageRef.current.addEventListener('load', async () => {
        clearCanvas(canvasRef.current);

        const detectOnImage = await detectOnImageFetch;
        const results = await detectOnImage(imageRef.current);
        console.log(results);

        if (results.length > 0) {
          drawResultBoxes(canvasRef.current, results);
          dispatch({type: 'success', payload: {results}});
        } else {
          dispatch({type: 'error'});
        }
      });
    },
    [reader, canvasRef, imageRef, detectOnImageFetch]
  );

  const handleShowExampleClick = useCallback(() => handleSetImage('wireframe-example.jpg'), []);

  const openFilePicker = useCallback(() => {
    if (loading) {
      return;
    }
    filePickerRef.current.click();
  }, [loading]);

  const handleSetImage = useCallback(async (src) => {
    if (loading) {
      return;
    }
    dispatch({type: 'loading', payload: {image: src}});
  }, [loading]);

  const componentNames = results.map(({class: label}) => label);

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

  for (const {class: label, score, boundingBox: {x, y, width, height}} of results) {
    ctx.strokeRect(x, y, width, height);
    const textWidth = ctx.measureText(constructLabel(label, score)).width;
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  }

  for (const {class: label, score, boundingBox: {x, y}} of results) {
    ctx.fillStyle = '#000000';
    ctx.fillText(constructLabel(label, score), x, y);
  }

  function constructLabel(classLabel, score) {
    return `${classLabel} (${Math.round(score*100)}%)`;
  }
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
