import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import styled from "styled-components";

interface MenuItemBoxProps {
  focused: boolean;
}

function MenuItem({text}:{text:string}) {
  const { ref, focused } = useFocusable();


  const MenuItemBox = styled.div<MenuItemBoxProps>`
    width: 395px;
    height: 75px;
    background-color: ${({ focused }) =>
      focused ? '#565b6b' : '#1d1d1d00' };
    border-color: white;
    box-sizing: border-box;
    border-radius: 7px;
    margin-bottom: 37px;
    color: white;
    margin-top: 10px;
    font-family: 'Segoe UI';
    font-size: 24px;
    font-weight: 400;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    `;

  return <MenuItemBox ref={ref} focused={focused}> {text} </MenuItemBox>;
}


export default MenuItem;
