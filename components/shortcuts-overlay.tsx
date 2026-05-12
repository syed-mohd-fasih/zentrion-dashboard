"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

type Shortcut = { keys: string[]; label: string };

const IS_MAC =
	typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const MOD_LABEL = IS_MAC ? "⌘" : "Ctrl";

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
	{
		group: "Global",
		items: [
			{ keys: [MOD_LABEL, "K"], label: "Open command palette" },
			{ keys: ["?"], label: "Show this shortcuts overlay" },
			{ keys: ["Esc"], label: "Close any open overlay" },
		],
	},
	{
		group: "Navigation",
		items: [
			{ keys: [MOD_LABEL, "D"], label: "Go to Dashboard" },
			{ keys: [MOD_LABEL, "A"], label: "Go to Anomalies" },
			{ keys: [MOD_LABEL, "S"], label: "Go to Services" },
			{ keys: [MOD_LABEL, "P"], label: "Go to Policy Review" },
			{ keys: [MOD_LABEL, "H"], label: "Go to Audit Log" },
			{ keys: [MOD_LABEL, ","], label: "Go to Settings" },
		],
	},
];

// Map of `event.key` (lowercase) → destination route. Triggered when the
// modifier (Ctrl on Win/Linux, ⌘ on macOS) is also pressed.
const NAV_TARGETS: Record<string, string> = {
	d: "/dashboard",
	a: "/anomalies",
	s: "/services",
	p: "/policy-review",
	h: "/history",
	",": "/settings",
};

function isTypingTarget(el: EventTarget | null): boolean {
	if (!el || !(el instanceof HTMLElement)) return false;
	if (el.isContentEditable) return true;
	const tag = el.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function ShortcutsOverlay() {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const onShow = () => setOpen(true);
		window.addEventListener("zentrion:show-shortcuts", onShow);
		return () => window.removeEventListener("zentrion:show-shortcuts", onShow);
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// `?` (Shift+/) opens the overlay — only when not typing.
			if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				if (isTypingTarget(e.target)) return;
				e.preventDefault();
				setOpen(true);
				return;
			}

			// Mod (Ctrl on win/linux, ⌘ on mac) + letter for navigation.
			const usingMod = IS_MAC ? e.metaKey : e.ctrlKey;
			if (!usingMod || e.shiftKey || e.altKey) return;
			if (isTypingTarget(e.target)) return;

			const target = NAV_TARGETS[e.key.toLowerCase()];
			if (!target) return;

			// Block the browser default (Ctrl+S/P/A/D/H are otherwise hijacked).
			e.preventDefault();
			router.push(target);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [router]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Keyboard className="h-5 w-5 text-primary" />
						Keyboard shortcuts
					</DialogTitle>
					<DialogDescription>
						Speed up the parts of the app you use most.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-5 mt-2">
					{SHORTCUTS.map((group) => (
						<div key={group.group}>
							<p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
								{group.group}
							</p>
							<ul className="space-y-1.5">
								{group.items.map((s) => (
									<li key={s.label} className="flex items-center justify-between text-sm">
										<span className="text-foreground">{s.label}</span>
										<span className="flex gap-1">
											{s.keys.map((k, i) => (
												<kbd
													key={`${s.label}-${i}`}
													className="inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-2 py-0.5 text-xs font-mono text-muted-foreground min-w-[1.75rem]"
												>
													{k}
												</kbd>
											))}
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
