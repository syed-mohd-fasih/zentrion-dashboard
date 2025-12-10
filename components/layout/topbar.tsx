"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Topbar() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-30">
			<div className="flex-1" />

			{/* Actions */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					className="rounded-lg"
				>
					{mounted ? (
						theme === "dark" ? (
							<Sun className="w-5 h-5" />
						) : (
							<Moon className="w-5 h-5" />
						)
					) : (
						<div className="w-5 h-5" />
					)}
				</Button>

				<Button variant="ghost" size="icon" className="rounded-lg">
					<Bell className="w-5 h-5" />
				</Button>

				<Link href="/auth/me">
					<Button variant="ghost" size="icon" className="rounded-lg">
						<User className="w-5 h-5" />
					</Button>
				</Link>
			</div>
		</header>
	);
}
