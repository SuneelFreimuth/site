import type { Metadata } from "next";
import {
  Lora,
  EB_Garamond,
  Source_Serif_4,
  Cormorant_Garamond,
  Quintessential,
  IBM_Plex_Serif,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { Nav } from "@/components/nav";
import { gifs, icons } from "@/lib/assets";
import Image from "next/image";
import { ReactNode } from "react";

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

const quintessential = Quintessential({
  variable: "--font-quintessential",
  subsets: ["latin"],
  weight: ["400"],
});

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ["latin"],
  weight: ["200", "400", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Suneel Freimuth",
  description: "Suneel Freimuth's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          "antialiased",
          // lora.className,
          // ebGaramond.className,
          // sourceSerif4.className,
          // cormorantGaramond.className,
          // quintessential.className,
          // ibmPlexSerif.className,
          playfairDisplay.className,
        )}
      >
        <NavLayout>
          <UnderConstructionLayout>{children}</UnderConstructionLayout>
        </NavLayout>
      </body>
    </html>
  );
}

function NavLayout({ children }: { children: ReactNode }) {
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
              href: "/library",
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
                  <Image
                    src={icons.github}
                    alt="Github logo"
                    width={20}
                    height={20}
                    className="h-[1rem] inline dark:invert w-auto"
                  />
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

function UnderConstructionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <div className="group fixed bottom-0 right-0">
        <Image
          src={gifs.underConstruction}
          alt={'"Under Construction" animation'}
          width={96}
          height={64}
          loading='eager'
        />
        <div className="absolute opacity-0 group-hover:opacity-100 bottom-0 right-full px-2 text-nowrap">
          Paint is wet
        </div>
      </div>
    </>
  );
}
