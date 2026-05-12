"use client";

import { User, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectionDot } from "@/components/dashboard/connection-dot";
import { useCommandPalette } from "@/components/command-palette";

export function Topbar() {
	const { open } = useCommandPalette();
	const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

	return (
		<header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-card/60 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 z-30">
			<div className="flex-1" />

			<div className="flex items-center gap-2">
				<ConnectionDot />

				<motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
					<Button
						variant="ghost"
						size="sm"
						onClick={open}
						className="rounded-lg gap-2 text-muted-foreground hover:text-foreground"
					>
						<Command className="w-4 h-4" />
						<span className="hidden md:inline text-xs font-mono">
							{isMac ? "⌘" : "Ctrl"} K
						</span>
					</Button>
				</motion.div>

				<motion.div whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
					<Link href="/auth/me">
						<Button variant="ghost" size="icon" className="rounded-lg">
							<User className="w-5 h-5" />
						</Button>
					</Link>
				</motion.div>
			</div>
		</header>
	);
}
