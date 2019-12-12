import React from 'react';
import {AppProvider, Page} from '@shopify/polaris';
import "@shopify/polaris/styles.css";

import TextField from './components/TextField';
import CustomerList from './components/CustomerList';

function Prototype({components}) {
  const hasPage = components.includes('Page');
  return (
    <AppProvider>
      <Page
        title={hasPage ? 'Page' : null}
        primaryAction={hasPage ? {content: 'Save'} : null}
      >
        {components.map((name, idx) => {
          switch(name) {
            case 'TextField':
              return <TextField key={idx} />;
            case 'CustomerList':
                return <CustomerList key={idx} />;
          }
        })}
      </Page>
    </AppProvider>
  );
}

export default Prototype;
