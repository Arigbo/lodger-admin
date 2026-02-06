import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import AdminLayout from "@/components/admin-layout";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-headline",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Lodger Admin",
    description: "Administrative dashboard for Lodger property management.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans bg-[#050505] text-white antialiased selection:bg-primary/30`}>
                <AdminLayout>{children}</AdminLayout>
            </body>
        </html>
    );
}

