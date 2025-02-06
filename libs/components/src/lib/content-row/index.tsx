import { FocusableComponentLayout, FocusContext, FocusDetails, KeyPressDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import Asset from "../asset";
import Card from "../card";
import { cardUtilities, commonUtilities } from "@enlight-webtv/utilities";
import styled from "styled-components";
import { useCallback, useRef } from "react";
import { ItemSize } from "@enlight-webtv/models";

const { isValidValue } = commonUtilities;
const { getCardDimension } = cardUtilities;



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
  width: fit-content;
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
  config = {},
  updatePreview,
}: ContentRowProps) {
  const { ref, focusKey, focused } = useFocusable({
    onFocus
  });

  const scrollingRef = useRef(null);
  const railData: any[] = data?.status === 'fulfilled' ? data?.value?.content ?? [] : [];



  const onAssetFocus = useCallback(
    ({ x }: { x: number }) => {
      scrollingRef?.current?.scrollTo({
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

                return (<Card key={index} onFocus={onAssetFocus} focusKey={`card-${data.title}-${index}`}  updatePreview={updatePreview}
                  data={data}
                  onClick={() => {/** */ }}
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


export default ContentRow;
