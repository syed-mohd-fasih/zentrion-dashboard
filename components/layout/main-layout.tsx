"use client";

import type React from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
			<ProtectedRoute>
				<Sidebar />
				<Topbar />
				<main className="fixed inset-0 top-16 left-0 right-0 md:left-64 overflow-auto bg-background">
					{children}
				</main>
			</ProtectedRoute>
		</ThemeProvider>
	);
}
