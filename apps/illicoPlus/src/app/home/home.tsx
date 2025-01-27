'use client'

import { Card, CardSkelton } from '@enlight-webtv/ui-components';
import styles from './home.module.scss';

export function Home() {
  return (
    <div className={styles['container']}>

      <Card
        thumbnail="https://via.placeholder.com/300x400"
        startTime="5:30pm"
        endTime="7:30pm"
        title="SS3 - El Chocolate 1"
        isBadgeVisible={true}
        badgeText="LIVE"
        logo="https://via.placeholder.com/40"
        progress={50}
        isFocused={true}
        onClick={()=>{/**empty*/}}
    />
    </div>
  );
}

export default Home;
