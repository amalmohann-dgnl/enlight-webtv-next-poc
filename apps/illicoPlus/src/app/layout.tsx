'use client'
import styled from 'styled-components';
import './global.css';


const AppContainer = styled.div`
  background-color:'#1f1f1f';
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: row;
`;


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <body>
      <AppContainer>
          {children}
          </AppContainer>
      </body>
    </html>
  );
}
