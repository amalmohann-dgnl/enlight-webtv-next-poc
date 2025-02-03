import './global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  return (
    <html lang="en">
      <head>
        <script type="text/javascript">
            {`//dplayer special handling
            if (global === undefined) {
              var global = window;
            }`}
        </script>
      </head>
      <body>{children}</body>
    </html>
  );
}
