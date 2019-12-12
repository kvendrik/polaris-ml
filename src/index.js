import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import objectDetector from '@cloud-annotations/object-detection';
import './main.scss';

const STATUS_MESSAGES = {
  idle: 'Enter a whiteboard sketch using the file picker.',
  loading: 'Loading...',
  noResults: 'No components detected. Please try again or check the console for the raw output.'
};

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const [image, setImage] = useState('');

  const [status, setStatus] = useState(STATUS_MESSAGES.idle);
  const [results, setResults] = useState([]);

  const handleImageChange = useCallback(({target: {files: [selectedFile]}}) =>
    reader.readAsDataURL(selectedFile),
    [reader]
  );

  useEffect(() => {
    reader.addEventListener('load', async ({target: {result: src}}) => {
      setImage(src);
      setStatus(STATUS_MESSAGES.loading);
      setResults([]);

      const results = await detectObjectsInImage(imageRef.current);
      console.log(results);

      if (results.length > 0) {
        setStatus(STATUS_MESSAGES.idle);
        setResults(results);
      } else {
        setStatus(STATUS_MESSAGES.noResults);
      }
    });
  }, [reader]);

  const resultsTable = results.length > 0 && (
    <table border="1">
      <thead>
        <tr>
          <th>Class</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {results.map(({class: label, score}, index) => (
          <tr key={`${label}${score}${index}`}>
            <td>{label}</td>
            <td>{score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <main className="container">
      <p>{status}</p>
      <input type="file" onChange={handleImageChange} />
      {resultsTable}
      <img className="image" src={image} ref={imageRef} alt="" />
      <p className="subdued">
        Not sure what to sketch? Have a look at the <a href="https://github.com/kvendrik/polaris-ml/tree/master/training-data" target="_blank" rel="noopener noreferrer">training data (examples)</a>.
      </p>
    </main>
  );
}

async function detectObjectsInImage(imageNode) {
  const model = await objectDetector.load('model');
  return model.detect(imageNode);
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
