import { FocusableComponentLayout, FocusDetails, KeyPressDetails, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import styled from "styled-components";


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

export default Asset;
