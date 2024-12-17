import styles from './page.module.scss';

import { Splash } from '@enlight-webtv/pages'

export default function Index() {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

  /*
   * Replace the elements be
   * Note: The corresponding styles are in the ./index.scss file.
   */
  return (
    <div className={styles.page}>
      <Splash src={''} isMediaSplash={false} mediaType={''} showLoader={false} showVersion={false}/>
    </div>
  );
}
