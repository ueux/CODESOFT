import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'E-Com Selller',
  description: 'E-Commerce Website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers></body>
    </html>
  )
}
