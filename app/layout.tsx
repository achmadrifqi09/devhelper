import type { Metadata } from "next";
import Script from "next/script";
import { Onest } from "next/font/google";

import "./globals.css";
import { Toaster } from "sonner";

const onest = Onest({
    subsets: ["latin"],
    variable: "--font-onest",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Devhelper",
    description:
        "A simple way to convert a postman collection into an open API schema with just a few clicks.",
    keywords: ["Postman", "OpenAPI", "Dev Tools", "API Converter"],
    authors: [{ name: "Devhelper Team", url: "https://devhelper.online" }],
    openGraph: {
        title: "Devhelper - Convert Postman to OpenAPI",
        description:
            "Convert your Postman collections into OpenAPI schemas instantly.",
        url: "https://devhelper.online",
        siteName: "Devhelper",
        images: [
            {
                url: "https://devhelper.online/og-image.png",
                width: 1200,
                height: 630,
                alt: "Devhelper Open Graph Image",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Devhelper - Convert Postman to OpenAPI",
        description:
            "A simple tool to convert Postman collections to OpenAPI schema.",
        images: ["https://devhelper.online/logo.png"],
    },
    metadataBase: new URL("https://devhelper.online"),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${onest.variable}`}>
            <head>
                <Script id="gtm-script" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','GTM-KGWT5P7L');
                    `}
                </Script>
            </head>
            <body className="antialiased">
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-KGWT5P7L"
                        height="0"
                        width="0"
                        style={{ display: "none", visibility: "hidden" }}
                    ></iframe>
                </noscript>
                <Toaster />
                {children}
            </body>
        </html>
    );
}
