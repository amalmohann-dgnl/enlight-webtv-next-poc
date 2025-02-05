/* eslint-disable @typescript-eslint/no-empty-function */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFocusable, FocusContext, init } from '@noriginmedia/norigin-spatial-navigation';
import styles from './home.module.scss';
import { Rail, Spinner, PreviewComponent } from '@enlight-webtv/ui-components';
import {
  CacheValue,
  ComponentStyleType,
  ContinueWatchingData,
  ItemSize,
  PageComponent,
  PreviewComponentDataNew,
  PurchaseMode,
  RailContentModel,
  Routes,
  SubscriptionBadge,
  TopLabelType,
} from '@enlight-webtv/models';
import { commonUtilities, cardUtilities } from '@enlight-webtv/utilities';

const { isValidValue } = commonUtilities;

init({
  debug: false,
  visualDebug: false
});

const previewData: PreviewComponentDataNew = {
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
  showSeasonCount: false,
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
  thumbnailHeight: 650,
};



export function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);
  const { ref, focusKey, focusSelf, focused } = useFocusable({ focusKey: 'HOME', trackChildren: true, focusable: true});


    useEffect(() => {
      if (focused) {
        console.log(`Home Focus State -> ${focusKey}: ${focused ? 'FOCUSED' : 'NOT FOCUSED'}`);
      }
    }, [focused]);

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

      return (
        <Rail
          key={`${index}-${component?.title}`}
          title={component?.title}
          titleColor={componentStyle?.titleColor || '#FFFFFF'}
          data={railData}
          theme={component?.theme?.[0]}
          itemSize={componentStyle?.itemSize ?? ItemSize.medium}
          itemOrientation={componentStyle?.itemOrientation ?? 1.67}
          useSkeletonLoader={false}
          autoFocus={index === 0}
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
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className={styles.container} style={{ display: 'flex', flexDirection: 'column', gap: 40, marginLeft: 10, marginTop: 10 }}>
        {rails}
      </div>
    </FocusContext.Provider>
    // <div className={styles['container']}>
    //   <PreviewComponent
    //     {...previewData}
    //   />
    // </div>
  );
}

export default Home;
