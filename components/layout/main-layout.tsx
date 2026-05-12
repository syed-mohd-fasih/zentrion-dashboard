"use client";

import type React from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/page-transition";
import { CommandPaletteProvider } from "@/components/command-palette";
import { ShortcutsOverlay } from "@/components/shortcuts-overlay";
import { OnboardingTour } from "@/components/onboarding/tour";

export function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<CommandPaletteProvider>
				<Sidebar />
				<Topbar />
				<main className="fixed inset-0 top-16 left-0 right-0 md:left-64 overflow-auto bg-background">
					<PageTransition>{children}</PageTransition>
				</main>
				<ShortcutsOverlay />
				<OnboardingTour />
			</CommandPaletteProvider>
		</ProtectedRoute>
	);
}
