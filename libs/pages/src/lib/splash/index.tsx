import { SplashMediaType } from '@enlight-webtv/models'


type Props = {
  src: string;
  isMediaSplash: boolean;
  mediaType: SplashMediaType;
  showLoader: boolean;
  showVersion: boolean;
}

const Splash = ({src, isMediaSplash, showLoader, showVersion}: Props) => {



  return (
    <div>Splash</div>
  )
}

export default Splash
