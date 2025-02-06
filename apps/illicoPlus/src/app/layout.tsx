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
      <head>
      <script
          dangerouslySetInnerHTML={{
            __html: `!function(t){function e(){var e=this||self;e.globalThis=e,delete t.prototype._T_}"object"!=typeof globalThis&&(this?e():(t.defineProperty(t.prototype,"_T_",{configurable:!0,get:e}),_T_))}(Object);`,
          }}
        />
        </head>
      <body>
      <AppContainer>
          {children}
          </AppContainer>
      </body>
    </html>
  );
}
