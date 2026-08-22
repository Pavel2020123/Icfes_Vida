import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import SoporteWhatsApp from "../components/SoporteWhatsApp";
import TutorialPrimerIngreso from "../components/TutorialPrimerIngreso";
import { DESCRIPCION_SITIO, NOMBRE_SITIO, URL_SITIO } from "../lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: URL_SITIO,
  title: {
    default: "SaberPlus | Preparación para las pruebas Saber 11",
    template: "%s | SaberPlus",
  },
  description: DESCRIPCION_SITIO,
  applicationName: NOMBRE_SITIO,
  authors: [{ name: NOMBRE_SITIO, url: URL_SITIO }],
  creator: NOMBRE_SITIO,
  publisher: NOMBRE_SITIO,
  category: "education",
  keywords: [
    "ICFES",
    "Saber 11",
    "preicfes virtual",
    "simulacros ICFES",
    "preparación ICFES",
    "preguntas Saber 11",
    "plan de estudio ICFES",
  ],
  alternates: {
    canonical: "/",
    languages: { "es-CO": "/" },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: NOMBRE_SITIO,
    title: "SaberPlus | Preparación para las pruebas Saber 11",
    description: DESCRIPCION_SITIO,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SaberPlus, preparación para las pruebas Saber 11",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaberPlus | Preparación para las pruebas Saber 11",
    description: DESCRIPCION_SITIO,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: {
    "geo.region": "CO",
    "content-language": "es-CO",
  },
};

const datosEstructurados = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${URL_SITIO.origin}/#organization`,
      name: NOMBRE_SITIO,
      url: URL_SITIO.origin,
      email: "soporte@icfesvida.com",
    },
    {
      "@type": "WebSite",
      "@id": `${URL_SITIO.origin}/#website`,
      url: URL_SITIO.origin,
      name: NOMBRE_SITIO,
      description: DESCRIPCION_SITIO,
      inLanguage: "es-CO",
      publisher: { "@id": `${URL_SITIO.origin}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${URL_SITIO.origin}/#application`,
      name: NOMBRE_SITIO,
      url: URL_SITIO.origin,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "es-CO",
      description: DESCRIPCION_SITIO,
      audience: [
        { "@type": "EducationalAudience", educationalRole: "student" },
        { "@type": "EducationalAudience", educationalRole: "teacher" },
      ],
      offers: {
        "@type": "Offer",
        price: "45000",
        priceCurrency: "COP",
        availability: "https://schema.org/InStock",
        url: `${URL_SITIO.origin}/planes`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(datosEstructurados).replace(
                /</g,
                "\\u003c",
              ),
            }}
          />
          {children}
          <SoporteWhatsApp />
          <TutorialPrimerIngreso />
        </ThemeProvider>
      </body>
    </html>
  );
}
