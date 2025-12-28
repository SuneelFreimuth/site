import type { Metadata } from "next";
import {
  Lora,
  EB_Garamond,
  Source_Serif_4,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { Nav } from "@/components/nav";
import { icons } from "@/lib/assets";
import Image from "next/image";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suneel Freimuth",
  description: "Suneel Freimuth's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          "antialiased",
          lora.className,
          ebGaramond.className,
          sourceSerif4.className,
          cormorantGaramond.className,
        )}
      >
        <NavLayout>{children}</NavLayout>
      </body>
    </html>
  );
}

function NavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="fixed top-0 left-0 w-full p-4">
        <Nav
          links={[
            // {
            //   href: "/flow",
            //   content: "Simulations",
            // },
            {
              href: "/reading",
              content: (
                <span>
                  <span style={{ zIndex: 3 }}>📚</span> Library
                </span>
              ),
            },
            {
              href: "https://github.com/SuneelFreimuth",
              content: (
                <span className="flex items-center gap-1">
                  <Image src={icons.github} alt="Github logo" width={20} height={20} className="h-[1rem] inline" />
                  Github
                </span>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
