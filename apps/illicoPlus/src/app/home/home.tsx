'use client'

import { Card, CardSkelton, Rail } from '@enlight-webtv/ui-components';
import styles from './home.module.scss';
import { CardType, ComponentStyleType, ItemSize } from '@enlight-webtv/models';


const mockData = {
  content: [
    {
      uid: '1',
      title: 'Item 1',
      images: [{ url: 'https://via.placeholder.com/150' }],
    },
    {
      uid: '2',
      title: 'Item 2',
      images: [{ url: 'https://via.placeholder.com/150' }],
    },
    {
      uid: '3',
      title: 'Item 3',
      images: [{ url: 'https://via.placeholder.com/150' }],
    },
  ],
};

const handleCardPress = (item) => {
  console.log('Card clicked:', item);
};


export function Home() {
  return (
    <div className={styles['container']}>

<div style={{ backgroundColor: '#000', color: '#FFF', padding: '20px' }}>
      <h1>Rail Component Example</h1>
      <Rail
          title="Featured Rail"
          titleColor="#FFD700"
          itemSize={ItemSize.medium}
          cardType={CardType.Card}
          componentData={{}}
          railHandlingType={null}
          data={mockData}
          showComponentTitle={true}
          showItemTitle={true}
          handleEnterPressOnCards={handleCardPress}
          useSkeletonLoader={true} theme={undefined} progressData={undefined} hoverTarget={undefined} recommendationID={undefined}      />
    </div>
    </div>
  );
}

export default Home;
