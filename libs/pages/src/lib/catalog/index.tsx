/**
 * Since this file is for development purposes only, some of the dependencies are in devDependencies
 * Disabling ESLint rules for these dependencies since we know it is only for development purposes
 */

import { Card, ContentRow, PreviewComponent, Rail, SideBar } from '@enlight-webtv/ui-components';
import { FocusableComponentLayout, FocusContext, FocusDetails, init, KeyPressDetails, useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import React, { useCallback, useEffect, useState, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import styled, { createGlobalStyle } from 'styled-components';

import { cardUtilities, commonUtilities, previewComponentUtilities } from '@enlight-webtv/utilities';
import { AssetTypeIcon, ContinueWatchingData, Image, ItemSize, PreviewComponentDataNew, PurchaseMode, RailContentModel, Routes, SubscriptionBadge, TopLabelType } from '@enlight-webtv/models';

const { getDataForPreview } = previewComponentUtilities;
const { isValidValue, getOptimizedImage } = commonUtilities;
const { getCardDimension } = cardUtilities

init({
  debug: false,
  visualDebug: false,
  distanceCalculationMethod: 'center'
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
  handlePreviewLeft: () => {/** */},
  handlePreviewRight: () => {/** */},
  handlePreviewDown: () => {/** */},
  handlePreviewUp: () => {/** */},
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


const ContentWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ScrollingRows = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 1;
  flex-grow: 1;
`;

function Content({ isLoading, data, config }: { isLoading: boolean, data: any, config: any }) {

  const { ref, focusKey, focused } = useFocusable({focusKey: "CONTENT"});
  const [previewData, setPreviewData] = useState(previewDummyData);

  const onRowFocus = useCallback(
    ({ y }: { y: number }) => {
      ref.current.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    },
    [ref]
  );


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


  return (
    <FocusContext.Provider value={focusKey}>
      <ContentWrapper>
      <PreviewComponent {...previewData} />
        <ScrollingRows ref={ref}>
          <div>
            {
              [...(config.components)].map((component, index) => (
              <ContentRow
                key={`${index}-${component?.title}`}
                title={component?.title}
                onAssetPress={updatePreview}
                  onFocus={onRowFocus}
                  updatePreview={updatePreview}
                // isShuffleSize={Math.random() < 0.5} // Rows will have children assets of different sizes, randomly setting it to true or false.
                  isLoading={false}
                  config={component}
                  data={data[index]}
                />
            ))
            }
          </div>
        </ScrollingRows>
      </ContentWrapper>
    </FocusContext.Provider>
  );
}


const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar {
    display: none;
  }
`;

function Series(prop: { isLoading: boolean, data: any, config: any }) {
  console.log('prop',prop);

  return (
        <><GlobalStyle /><SideBar focusKey="MENU" /><Content {...prop} /></>
  );
}

export default Series;
