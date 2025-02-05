/**
 * Since this file is for development purposes only, some of the dependencies are in devDependencies
 * Disabling ESLint rules for these dependencies since we know it is only for development purposes
 */

import { Card, PreviewComponent, Rail, SideBar } from '@enlight-webtv/ui-components';
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

const rows = [
  {
    title: 'Recommended'
  },
  {
    title: 'Movies'
  },
  {
    title: 'Series'
  },
  {
    title: 'TV Channels'
  },
  {
    title: 'Sport'
  }
];

const assets = [
  {
    title: 'Asset 1',
    color: '#343434'
  },
  {
    title: 'Asset 2',
    color: '#3e3e3e'
  },
  {
    title: 'Asset 3',
    color: '#373737'
  },
  {
    title: 'Asset 4',
    color: '#363636'
  },
  {
    title: 'Asset 5',
    color: '#3a3a3a'
  },
  {
    title: 'Asset 6',
    color: '#353535'
  },
  {
    title: 'Asset 7',
    color: '#393939'
  },
  {
    title: 'Asset 8',
    color: '#3f3f3f'
  },
  {
    title: 'Asset 9',
    color: '#3d3d3d'
  }
];

const AssetWrapper = styled.div`
  margin-right: 22px;
  display: flex;
  flex-direction: column;
`;

interface AssetBoxProps {
  index: number;
  isShuffleSize: boolean;
  focused: boolean;
  color: string;
}

const AssetBox = styled.div<AssetBoxProps>`
  width: ${({ isShuffleSize, index }) =>
    isShuffleSize ? `${80 + index * 30}px` : '225px'};
  height: 127px;
  background-color: ${({ color }) => color};
  border-color: white;
  border-style: solid;
  border-width: ${({ focused }) => (focused ? '6px' : 0)};
  box-sizing: border-box;
  border-radius: 7px;
`;

const AssetTitle = styled.div`
  color: white;
  margin-top: 10px;
  font-family: 'Segoe UI';
  font-size: 24px;
  font-weight: 400;
`;

interface AssetProps {
  index: number;
  isShuffleSize: boolean;
  title: string;
  color: string;
  onEnterPress: (props: object, details: KeyPressDetails) => void;
  onFocus: (
    layout: FocusableComponentLayout,
    props: object,
    details: FocusDetails
  ) => void;
}

function Asset({
  title,
  color,
  onEnterPress,
  onFocus,
  isShuffleSize,
  index
}: AssetProps) {
  const { ref, focused } = useFocusable({
    onEnterPress,
    onFocus,
    extraProps: {
      title,
      color
    }
  });

  return (
    <AssetWrapper ref={ref}>
      <AssetBox
        index={index}
        color={color}
        focused={focused}
        isShuffleSize={isShuffleSize}
      />
      <AssetTitle/>
    </AssetWrapper>
  );
}

const ContentRowWrapper = styled.div`
  margin-bottom: 37px;
`;

const ContentRowTitle = styled.div`
  color: white;
  margin-bottom: 22px;
  font-size: 27px;
  font-weight: 700;
  font-family: 'Segoe UI';
  padding-left: 60px;
`;

const ContentRowScrollingWrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 1;
  flex-grow: 1;
  padding-left: 60px;
`;

const ContentRowScrollingContent = styled.div`
  display: flex;
  flex-direction: row;
`;

interface ContentRowProps {
  isShuffleSize?: boolean;
  title: string;
  onAssetPress: (props: object, details: KeyPressDetails) => void;
  onFocus: (
    layout: FocusableComponentLayout,
    props: object,
    details: FocusDetails
  ) => void;
  isLoading: boolean;
  data?:any;
  config?: any;
}

function ContentRow({
  title: rowTitle,
  onAssetPress,
  onFocus,
  isShuffleSize,
  isLoading = false,
  data ={},
  config ={},
}: ContentRowProps) {
  const { ref, focusKey } = useFocusable({
    onFocus
  });

  const scrollingRef = useRef(null);
  const railData: any[] = data?.status === 'fulfilled' ? data?.value?.content ?? [] : [];

  const onAssetFocus = useCallback(
    ({ x }: { x: number }) => {
      scrollingRef.current.scrollTo({
        left: x,
        behavior: 'smooth'
      });
    },
    [scrollingRef]
  );

  return (
    <FocusContext.Provider value={focusKey}>
      <ContentRowWrapper ref={ref}>
        <ContentRowTitle>{rowTitle}</ContentRowTitle>
        <ContentRowScrollingWrapper ref={scrollingRef}>
          <ContentRowScrollingContent>
            {isLoading ? assets.map(({ title, color }, index) => (
              <Asset
                index={index}
                title={title}
                key={title}
                color={color}
                onEnterPress={onAssetPress}
                onFocus={onAssetFocus}
                isShuffleSize={!!isShuffleSize}
              />
            ))
              : railData?.map((data, index) => {

                return (<Card key={index} onFocus={onAssetFocus} focusKey={onAssetFocus} updatePreview={onAssetFocus}
                  data={data}
                  onClick={() => { }}
                  dimensions={getCardDimension(config?.componentStyle?.[0]?.itemSize ?? ItemSize.medium, config?.componentStyle?.[0]?.itemOrientation ?? 1.67)}
                  thumbnailSrc={data?.images?.[0]?.url}
                  title={data.title}
                />)
              }
              )
          }
          </ContentRowScrollingContent>
        </ContentRowScrollingWrapper>
      </ContentRowWrapper>
    </FocusContext.Provider>
  );
}

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

function Content() {
  const { ref, focusKey } = useFocusable();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({} as any);
  const [previewData, setPreviewData] = useState(previewDummyData);

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

  // const appendRailsToCatalog = (data:any, pageComponents:any) => {
  //   return pageComponents.map((component:any, index:number) => {
  //     if (!isValidValue(component)) return null;

  //     const componentStyle = component?.componentStyle?.[0];
  //     const railData = data?.[index]?.status === 'fulfilled' ? data[index].value : undefined;
  //     const railConfig = config.components?.[index];
  //     const showComponentTitle = railConfig.componentStyle?.[0]?.showComponentTitle;

  //     return (
  //       <Rail
  //         key={`${index}-${component?.title}`}
  //         title={component?.title}
  //         showComponentTitle={showComponentTitle}
  //         titleColor={componentStyle?.titleColor || '#FFFFFF'}
  //         data={railData}
  //         theme={component?.theme?.[0]}
  //         itemSize={componentStyle?.itemSize ?? ItemSize.medium}
  //         itemOrientation={componentStyle?.itemOrientation ?? 1.67}
  //         useSkeletonLoader={false}
  //         autoFocus={index === 0}
  //         updatePreview={updatePreview} handleEnterPressOnCards={undefined}        />
  //     );
  //   });
  // };

  const onRowFocus = useCallback(
    ({ y }: { y: number }) => {
      ref.current.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    },
    [ref]
  );

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

  return (
    <FocusContext.Provider value={focusKey}>
      <ContentWrapper>
      <PreviewComponent {...previewData} />
        <ScrollingRows ref={ref}>
          <div>
            {isLoading ?
              rows.map(({ title }) => (
              <ContentRow
              key={title}
              title={''}
                  onAssetPress={() => { }}
              onFocus={() => { }}
              isShuffleSize={Math.random() < 0.5} // Rows will have children assets of different sizes, randomly setting it to true or false.
              isLoading={true} />
              ))
              :
              [...(config.components)].map((component, index) => (
              <ContentRow
                key={`${index}-${component?.title}`}
                title={component?.title}
                onAssetPress={updatePreview}
                onFocus={onRowFocus}
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

function Home() {
  return (
        <><GlobalStyle /><SideBar focusKey="MENU" /><Content /></>
  );
}

export default Home;
