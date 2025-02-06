import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import styled from 'styled-components';
import MenuItem from "../menu-item";
import { useEffect } from "react";
import { Routes } from "@enlight-webtv/models";


interface MenuWrapperProps {
  hasFocusedChild: boolean;
}

const MenuWrapper = styled.div<MenuWrapperProps>`
  flex: 1;
  height: 100vh;
  max-width: ${({ hasFocusedChild }) =>
    hasFocusedChild ? '400px' : '120px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify
  background-color: ${({ hasFocusedChild }) =>
    hasFocusedChild ? '#1f1f1f' : '#1f1f1e'};
  padding-top: 37px;
  justify-content: center;
  transition: max-width 0.4s ease-in-out;
`;

interface SidebarProps {
  focusKey: string;
}

function Sidebar({ focusKey: focusKeyParam }: SidebarProps) {
  const {
    ref,
    focusSelf,
    hasFocusedChild,
    focusKey
    // setFocus, -- to set focus manually to some focusKey
    // navigateByDirection, -- to manually navigate by direction
    // pause, -- to pause all navigation events
    // resume, -- to resume all navigation events
    // updateAllLayouts, -- to force update all layouts when needed
    // getCurrentFocusKey -- to get the current focus key
  } = useFocusable({
    focusable: true,
    saveLastFocusedChild: false,
    trackChildren: true,
    autoRestoreFocus: true,
    isFocusBoundary: false,
    focusKey: focusKeyParam,
    preferredChildFocusKey: null,
    onEnterPress: () => {},
    onEnterRelease: () => {},
    onArrowPress: () => true,
    onFocus: () => {},
    onBlur: () => {},
    extraProps: { foo: 'bar' }
  });

  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

  return (
    <FocusContext.Provider value={focusKey}>
      <MenuWrapper ref={ref} hasFocusedChild={hasFocusedChild}>
        <MenuItem text={hasFocusedChild ? "Home": "H"} route={Routes.HOMEPAGE} />
        <MenuItem text={hasFocusedChild ? "Series": "S"} route={Routes.SHOWS} />
        <MenuItem text={hasFocusedChild ? "Films": "F"} route={Routes.MOVIE} />
        <MenuItem text={hasFocusedChild ? "Divertissement": "D"} route={Routes.DIVERTISSEMENT} />
      </MenuWrapper>
    </FocusContext.Provider>
  );
}

export default Sidebar;
