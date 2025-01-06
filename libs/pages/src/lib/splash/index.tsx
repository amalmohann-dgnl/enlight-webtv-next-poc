import styles from './Splash.module.scss';
import { SplashMediaType } from '@enlight-webtv/models';
import Image from 'next/image';

type Props = {
  src: string;
  isMediaSplash: boolean;
  mediaType: SplashMediaType;
  showLoader: boolean;
  showVersion: boolean;
  bgColor: string;
};

const Splash = ({
  src,
  isMediaSplash,
  showLoader,
  showVersion,
  bgColor,
}: Props) => {
  return (
    <div id="splash" className={styles["splashDiv"]}>
      <Image
        src={src}
        layout="fill"
        objectFit="cover"
        alt="Splash"
      />
      {showLoader && (
        <div className={styles["spinner-container"]}>
          <Image
            src={'/images/spinner.png'}
            alt="spinner"
            width={75}
            height={75}
          />
        </div>
      )}
      {showVersion && (
        <div className={styles['version-info']} id="versionInfo">
          Version 1.0.0
        </div>
      )}
    </div>
  );
};

export default Splash;
