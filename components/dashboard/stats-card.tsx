"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "destructive" | "primary";

interface StatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: React.ReactNode;
	tone?: Tone;
}

const TONE_ACCENT: Record<Tone, string> = {
	default: "before:bg-border",
	primary: "before:bg-primary before:shadow-[0_0_12px_var(--primary)]",
	success: "before:bg-success before:shadow-[0_0_10px_var(--success)]",
	warning: "before:bg-warning before:shadow-[0_0_10px_var(--warning)]",
	destructive: "before:bg-destructive before:shadow-[0_0_10px_var(--destructive)]",
};

const TONE_ICON_BG: Record<Tone, string> = {
	default: "bg-muted/40 text-muted-foreground",
	primary: "bg-primary/10 text-primary ring-1 ring-primary/20",
	success: "bg-success/10 text-success ring-1 ring-success/20",
	warning: "bg-warning/10 text-warning ring-1 ring-warning/20",
	destructive: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
};

export function StatsCard({ title, value, subtitle, icon, tone = "default" }: StatsCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
		>
			<Card
				className={cn(
					"relative overflow-hidden hover:bg-card/80 hover:border-primary/30",
					"before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[2px] before:rounded-r-full",
					TONE_ACCENT[tone],
				)}
			>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
						{title}
					</CardTitle>
					{icon && (
						<div
							className={cn(
								"h-9 w-9 rounded-xl flex items-center justify-center",
								TONE_ICON_BG[tone],
							)}
						>
							{icon}
						</div>
					)}
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
					{subtitle && (
						<p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
