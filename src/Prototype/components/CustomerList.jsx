import React, {useState} from 'react';
import {Card, ResourceList, ResourceItem, Avatar, TextStyle} from '@shopify/polaris';

function CustomerList() {
  return (
    <Card>
      <ResourceList
        resourceName={{singular: 'customer', plural: 'customers'}}
        items={[
          {
            id: 341,
            url: 'customers/341',
            name: 'Mae Jemison',
            location: 'Decatur, USA',
          },
          {
            id: 256,
            url: 'customers/256',
            name: 'Ellen Ochoa',
            location: 'Los Angeles, USA',
          },
          {
            id: 214,
            url: 'customers/213',
            name: 'John Divee',
            location: 'Ottawa, Canada',
          }
        ]}
        renderItem={(item) => {
          const {id, url, name, location} = item;
          const media = <Avatar customer size="medium" name={name} />;

          return (
            <ResourceItem
              id={id}
              url={url}
              media={media}
              accessibilityLabel={`View details for ${name}`}
            >
              <h3>
                <TextStyle variation="strong">{name}</TextStyle>
              </h3>
              <div>{location}</div>
            </ResourceItem>
          );
        }}
      />
    </Card>
  );
}

export default CustomerList;
