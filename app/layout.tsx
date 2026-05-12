/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Zentrion Dashboard",
	description: "Modern policy management and anomaly detection dashboard",
	icons: {
		icon: [
			{
				url: "/icon-light-32x32.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/icon-dark-32x32.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/icon.svg",
				type: "image/svg+xml",
			},
		],
		apple: "/apple-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<body className={`font-sans antialiased`}>
				<ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
					<AuthProvider>
						<SocketProvider>{children}</SocketProvider>
					</AuthProvider>
					<Toaster richColors position="top-right" theme="dark" />
				</ThemeProvider>
			</body>
		</html>
	);
}
