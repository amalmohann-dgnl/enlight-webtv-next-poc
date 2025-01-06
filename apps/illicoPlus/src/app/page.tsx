import styles from './page.module.scss';
import { SplashMediaType } from '@enlight-webtv/models'
import { Splash } from '@enlight-webtv/pages'

export default function Index() {

  /*
   * Replace the elements be
   * Note: The corresponding styles are in the ./index.scss file.
   */
  return (
    <div className={styles.page}>
      <Splash src={'/images/splash.png'} isMediaSplash={false} mediaType={SplashMediaType.IMAGE} showLoader={true} showVersion={true} bgColor={''} />
    </div>
  );
}
