import "./global.css";
import Header from "../shared/widgets/header";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";
import Footer from "../shared/widgets/footer";

export const metadata = {
  title: "E-Com",
  description: "E-Commerce Application",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${poppins.variable} `}>
        <Providers>
          <Header />
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
