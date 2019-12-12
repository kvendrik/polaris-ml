import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import objectDetector from '@cloud-annotations/object-detection';
import './main.scss';

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const filePickerRef = useRef();

  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);

  const handleImageChange = useCallback(({target: {files: [selectedFile]}}) =>
    reader.readAsDataURL(selectedFile),
    [reader]
  );

  useEffect(() => {
    reader.addEventListener('load', async ({target: {result: src}}) => {
      setImage(src);

      setStatus('Loading...');
      setLoading(true);
      setResults([]);

      const results = await detectObjectsInImage(imageRef.current);
      console.log(results);

      if (results.length > 0) {
        setStatus('');
        setResults(results);
      } else {
        setStatus('No components detected. Please try again or check the console for the raw output.');
      }

      setLoading(false);
    });
  }, [reader]);

  const handleGetStartedClick = useCallback(() => filePickerRef.current.click(), []);

  const resultsTable = results.length > 0 && (
    <table border="1">
      <thead>
        <tr>
          <th>Component</th>
          <th>Confidence</th>
        </tr>
      </thead>
      <tbody>
        {results.map(({class: label, score}, index) => (
          <tr key={`${label}${score}${index}`}>
            <td>{label}</td>
            <td>{score * 100}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <main className="container">
      <p className="intro">This <a href="https://github.com/kvendrik/polaris-ml" target="_blank" rel="noopener noreferrer">experiment</a> allows you to upload a <a href="https://github.com/kvendrik/polaris-ml/tree/master/training-data" target="_blank" rel="noopener noreferrer">wireframe you sketched out</a> on a whiteboard and will tell you what <a href="https://polaris.shopify.com/components" target="_blank" rel="noopener noreferrer">Polaris components</a> you drew.</p>
      <button onClick={handleGetStartedClick} disabled={loading}>Upload a drawing</button>
      <input className="file-picker" ref={filePickerRef} type="file" onChange={handleImageChange} />
      <div className="result-status">
        <p>{status}</p>
        {resultsTable}
        <img className="image" src={image} ref={imageRef} alt="" />
      </div>
    </main>
  );
}

async function detectObjectsInImage(imageNode) {
  const model = await objectDetector.load('model');
  return model.detect(imageNode);
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
