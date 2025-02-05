/* eslint-disable @typescript-eslint/no-empty-function */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFocusable, FocusContext, init } from '@noriginmedia/norigin-spatial-navigation';
import styles from './home.module.scss';
import { Rail, Spinner, PreviewComponent } from '@enlight-webtv/ui-components';
import {
  AssetTypeIcon,
  CacheValue,
  ComponentStyleType,
  ContinueWatchingData,
  Image,
  ItemSize,
  PageComponent,
  PreviewComponentDataNew,
  PurchaseMode,
  RailContentModel,
  Routes,
  SubscriptionBadge,
  TopLabelType,
} from '@enlight-webtv/models';
import { commonUtilities, previewComponentUtilities } from '@enlight-webtv/utilities';

const { isValidValue, getOptimizedImage } = commonUtilities;
const { getDataForPreview } = previewComponentUtilities;

init({
  debug: false,
  visualDebug: false
});

const previewDummyData: PreviewComponentDataNew = {
  showVideoPreview: false,
  showBadges: true,
  showBadgeText: true,
  badgeTextLabel: "HD",
  badgeTextColor: "#bbbbbb",
  showTypeLogo: false,
  typeImageSrc: "",
  showContentSubscription: false,
  subscriptionBadge: {} as SubscriptionBadge, // Assuming it's an object
  showFlag: false,
  flagSrc: "",
  showStatus: false,
  statusLabelType: "important" as TopLabelType,
  statusLabel: "LIVE",
  showTimer: false,
  timerString: "null 30 Jan 2025 ",
  showTitle: true,
  titleLabel: "Un jour pour mourir",
  showContentInfo: true,
  showTime: false,
  timeLabelText: "THU 30 JAN 2025 ",
  showAdditionalTimeInfo: false,
  additionalTimeInfoLabel: "null",
  showDuration: true,
  durationLabel: "1 h 45 min ",
  showYear: true,
  yearLabel: "2022",
  showParentalRating: true,
  parentalRating: "13+",
  showQuality: false,
  qualityRating: "",
  showCaptions: true,
  captionsIconSrc: "/icons/captions/stc.png",
  showProgress: false,
  progressStartText: "CONTINUER",
  progressEndText: "",
  progress: 0,
  primaryActionType: false,
  secondaryActionType: false,
  showMoreInfo: false,
  tertiaryActionType: false,
  showDescription: true,
  descriptionText:
    "Un agent de probation déchu, endetté de deux millions de dollars envers un chef de gang, doit en 12 heures réaliser une série de braquages afin de rembourser une grosse dette, et du même coup, régler ses comptes avec le chef de police corrompu de la ville.",
  showActors: false,
  actors: [],
  showDirector: false,
  director: [],
  showGenre: false,
  genre: [],
  showCountryOfOrigin: false,
  countryOfOrigin: "",
  showDetailedRating: false,
  detailedRating: "",
  showOriginalLanguages: false,
  originalLanguages: "",
  showAudioLanguages: false,
  audioLanguages: "",
  showSubtitleLanguages: false,
  subtitleLanguages: "",
  images: [],
  graphics: [],
  purchaseMode: {} as PurchaseMode, // Assuming it's an object
  isSubscribed: false,
  currentEventStatus: null,
  streamUrl: "",
  type: "",
  seriesUid: "",
  continueWatchingData: {} as ContinueWatchingData, // Assuming it's an object
  uid: "",
  eventStartTime: null,
  eventEndTime: null,
  railType: "",
  cardId: "",
  trailers: [],
  cardData: {} as RailContentModel, // Assuming it's an object
  seasonCount: undefined,
  showSeasonCount: true,
  fromRelatedrail: false,
  previewImageUrl:
    "https://tr.vl-clubillico-vod.cdnsrv.videotron.ca/thumbnail/Videotron_Club_Illico_-_Prod/258/637/ADayToDie_QUB_VF_1280x720.jpg",
  seasonCountLabel: "",
  showActions: false,
  descriptionWordWrapWidth: 717,
  mediaId: "",
  handlePreviewLeft: () => {},
  handlePreviewRight: () => {},
  handlePreviewDown: () => {},
  handlePreviewUp: () => {},
  showSeasonButton: false,
  seasonText: "",
  seasonIconSrc: "",
  seasonIconBackgroundColor: "",
  showSeasonIcon: false,
  showRelatedInfo: false,
  relatedInfoLabel: "",
  thumbnailType: "large",
  thumbnailWidth: 1221,
  thumbnailHeight: 480,
};



export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);
  const [previewData, setPreviewData] = useState(previewDummyData);
  const { ref, focusKey, focusSelf } = useFocusable({ focusKey: 'HOME', trackChildren: true, focusable: true});

  // Update preview
  const updatePreview = (cardData: any) => {
    const data = getDataForPreview(cardData);

    //set the optimized image that are relevant to the card size
    const thumbnails = getOptimizedImage(cardData.images ?? cardData.graphics?.[0]?.images, [
      {
          width: cardData.width * 0.7,
          height: cardData.height * 0.7,
          itemOrientation: cardData.orientation,
      },
      { width: 1280, height: 720 },
    ]) as (AssetTypeIcon | Image)[];

    const thumbnailImage = thumbnails[0];
    const previewImage = thumbnails[1];
    const thumbnailUrl =
      (thumbnailImage as AssetTypeIcon)?.url ?? (thumbnailImage as Image)?.imageUrl ?? (thumbnailImage as Image)?.media?.file?.url;
    const previewImageUrl =
      (previewImage as AssetTypeIcon)?.url ?? (previewImage as Image)?.imageUrl ?? (previewImage as Image)?.media?.file?.url;
    
    // update captionSrc
    data.captionsIconSrc = '/icons/captions/stc.png'
    
    setPreviewData({ ...previewDummyData, ...data, previewImageUrl: previewImageUrl || thumbnailUrl, seasonCountLabel: `Seasons ${data.seasonCount}` });
    
  }
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [dataFetched, configFetched] = await import('@enlight-webtv/controllers')
        .then(({ catalogPageDataProvider }) => catalogPageDataProvider(Routes.HOMEPAGE));
      setData(dataFetched);
      setConfig(configFetched);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const appendRailsToCatalog = (data, pageComponents) => {
    return pageComponents.map((component, index) => {
      if (!isValidValue(component)) return null;

      const componentStyle = component?.componentStyle?.[0];
      const railData = data?.[index]?.status === 'fulfilled' ? data[index].value : undefined;
      const railConfig = config.components?.[index];
      const showComponentTitle = railConfig.componentStyle?.[0]?.showComponentTitle;
      
      return (
        <Rail
          key={`${index}-${component?.title}`}
          title={component?.title}
          showComponentTitle={showComponentTitle}
          titleColor={componentStyle?.titleColor || '#FFFFFF'}
          data={railData}
          theme={component?.theme?.[0]}
          itemSize={componentStyle?.itemSize ?? ItemSize.medium}
          itemOrientation={componentStyle?.itemOrientation ?? 1.67}
          useSkeletonLoader={false}
          autoFocus={index === 0}
          updatePreview={updatePreview}
        />
      );
    });
  };

  const rails = useMemo(() => {
    if (isValidValue(data) && isValidValue(config)) {
      focusSelf();
      return appendRailsToCatalog(data, config.components);
    }
    return [];
  }, [data, config, focusSelf]);

  if (isLoading) return <Spinner />;

  return (
    <>
      <div
        className={styles['container']}
        style={{ height: 550, display: 'flex', alignItems: 'center' }}
      >
        <PreviewComponent {...previewData} />
      </div>
      <FocusContext.Provider value={focusKey}>
        <div
          ref={ref}
          className={styles.container}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginLeft: 10,
          }}
        >
          {rails}
        </div>
      </FocusContext.Provider>
    </>
  );
  
  
}

export default Home;
