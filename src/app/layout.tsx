import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminLayout from "@/components/admin-layout";

const inter = Inter({ subsets: ["latin"] });

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
            <body className={`${inter.className} bg-[#050505]`}>
                <AdminLayout>{children}</AdminLayout>
            </body>
        </html>
    );
}

