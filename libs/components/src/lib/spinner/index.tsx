import styles from './spinner.module.scss';
import Image from 'next/image';

const Spinner = () => {
  return (
    <div id="splash" className={styles["splashDiv"]}>
        <div className={styles["spinner-container"]}>
          <Image
            src={'/images/spinner.png'}
            alt="spinner"
            width={75}
            height={75}
          />
        </div>
    </div>
  );
};

export default Spinner;
