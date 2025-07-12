import './global.css';
import Providers from './providers';
import {Poppins} from "next/font/google"


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

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
      <body >
        <Providers>{children}</Providers></body>
    </html>
  )
}
