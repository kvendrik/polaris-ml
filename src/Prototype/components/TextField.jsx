import React, {useState, useCallback} from 'react';
import {Card, TextField as PolarisTextField} from '@shopify/polaris';

function TextField() {
  const [value, setValue] = useState('');
  const handleChange = useCallback((newValue) => setValue(newValue), []);
  return (
    <Card sectioned>
      <PolarisTextField label="Text field" value={value} onChange={handleChange} />
    </Card>
  );
}

export default TextField;
