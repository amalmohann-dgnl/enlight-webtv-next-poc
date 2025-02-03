import Script from 'next/script';
import './global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  return (
    <html lang="en">


      <body>{children}</body>
      <Script
          id='globalThis'
          strategy="beforeInteractive"
          src="https://unpkg.com/@ungap/global-this@0.4.4/min.js"
      > </Script>
       <Script id='globalThis' type="text/javascript">
            {`//dplayer special handling
            if (global === undefined) {
              var global = window;
            }`}
        </Script>
    </html>
  );
}
