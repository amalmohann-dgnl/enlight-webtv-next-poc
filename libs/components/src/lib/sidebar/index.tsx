import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import styled from 'styled-components';
import MenuItem from "../menu-item";
import { useEffect } from "react";


interface MenuWrapperProps {
  hasFocusedChild: boolean;
}

const MenuWrapper = styled.div<MenuWrapperProps>`
  flex: 1;
  height:100vh;
  max-width:  400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify
  background-color: ${({ hasFocusedChild }) =>
    hasFocusedChild ? '#1f1f1f' : '#1f1f1e'};
  padding-top: 37px;
  justify-content: center;
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
        <MenuItem text="Home" />
        <MenuItem text="Series" />
        <MenuItem text="Search" />
        <MenuItem text="Settings" />
        <MenuItem text="logout" />
      </MenuWrapper>
    </FocusContext.Provider>
  );
}

export default Sidebar;
