import styles from './page.module.scss';
import { SplashMediaType } from '@enlight-webtv/models'
// import { initializeBooting  } from '@enlight-webtv/controllers'
import { Splash } from '@enlight-webtv/pages'
import { redirect } from 'next/navigation'
import { Suspense, use } from 'react';

export default function Index() {
  const RenderApplication = () => {
    use(initializeBooting());
    const isAuthenticated = true;
    if (isAuthenticated) {
      redirect('/home')
    } else {
      redirect('/login')
    }
  }

  /*
   * Replace the elements be
   * Note: The corresponding styles are in the ./index.scss file.
   */
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
        <Splash src={'/images/splash.png'} isMediaSplash={false} mediaType={SplashMediaType.IMAGE} showLoader={true} showVersion={true} bgColor={''} />
        }>
        <RenderApplication />
      </Suspense>
        </div>
  );
}

function initializeBooting(): import("react").Usable<unknown> {
  return new Promise((resolve)=> setTimeout(() => {
    return resolve(true);
  }, 5000))
}

