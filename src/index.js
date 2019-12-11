import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import objectDetector from '@cloud-annotations/object-detection';

function App() {
  const reader = useMemo(() => new FileReader(), []);
  const imageRef = useRef();
  const [image, setImage] = useState('');

  const handleImageChange = useCallback(({target: {files: [selectedFile]}}) =>
    reader.readAsDataURL(selectedFile),
    [reader]
  );

  useEffect(() => {
    reader.addEventListener('load', async ({target: {result: src}}) => {
      setImage(src);
      const result = await detectObjectsInImage(imageRef.current);
      console.log(result);
    });
  }, [reader]);

  return (
    <>
      <div><input type="file" onChange={handleImageChange} /></div>
      <img style={{maxWidth: '50%'}} src={image} ref={imageRef} alt="" />
    </>
  );
}

async function detectObjectsInImage(imageNode) {
  const model = await objectDetector.load('/model');
  const predictions = await model.detect(imageNode);
  console.log(predictions);
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
