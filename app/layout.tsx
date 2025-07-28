import type { Metadata } from "next";
import { Onest } from "next/font/google";

import "./globals.css";
import { Toaster } from "sonner";

const onest = Onest({
    subsets: ["latin"],
    variable: "--font-onest",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Convert Postman Collection to Open API",
    description:
        "A simple way to convert a postman collection into an open API schema with just a few clicks.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${onest.variable}`}>
            <body className="antialiased">
                <Toaster />
                {children}
            </body>
        </html>
    );
}
