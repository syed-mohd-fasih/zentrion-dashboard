"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	LayoutDashboard,
	AlertTriangle,
	Network,
	ShieldCheck,
	History,
	Settings,
	UserCog,
	Sparkles,
	RefreshCw,
	CheckCircle2,
	Keyboard,
} from "lucide-react";
import { useAnomalies, usePendingDrafts } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { canSee } from "@/components/auth/ProtectedRoute";
import type { UserRole } from "@/lib/api/types";

type CommandPaletteContextValue = {
	open: () => void;
	close: () => void;
	toggle: () => void;
	isOpen: boolean;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette(): CommandPaletteContextValue {
	const ctx = useContext(CommandPaletteContext);
	if (ctx) return ctx;
	// Fallback so consumers that mount outside the provider don't crash.
	return {
		open: () => undefined,
		close: () => undefined,
		toggle: () => undefined,
		isOpen: false,
	};
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { user } = useAuth();
	const { data: anomaliesData } = useAnomalies();
	const { data: draftsData } = usePendingDrafts();

	const navOptions: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; allowedRoles?: UserRole[] }[] = [
		{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
		{ href: "/services", label: "Services", icon: Network },
		{ href: "/policy-review", label: "Policy Review", icon: ShieldCheck },
		{ href: "/history", label: "Audit Log", icon: History },
		{ href: "/settings", label: "Settings", icon: Settings, allowedRoles: ["ADMIN", "ANALYST"] },
		{ href: "/access-control", label: "Access Control", icon: UserCog, allowedRoles: ["ADMIN"] },
	];
	const visibleNav = navOptions.filter((opt) => canSee(user?.role, opt.allowedRoles));

	const value = useMemo<CommandPaletteContextValue>(
		() => ({
			open: () => setIsOpen(true),
			close: () => setIsOpen(false),
			toggle: () => setIsOpen((v) => !v),
			isOpen,
		}),
		[isOpen],
	);

	// Global ⌘K / Ctrl+K handler.
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const go = useCallback(
		(path: string) => {
			setIsOpen(false);
			router.push(path);
		},
		[router],
	);

	const recentAnomalies = anomaliesData?.anomalies?.slice(0, 5) ?? [];
	const pendingDrafts = draftsData?.drafts?.slice(0, 3) ?? [];

	return (
		<CommandPaletteContext.Provider value={value}>
			{children}

			<CommandDialog
				open={isOpen}
				onOpenChange={setIsOpen}
				title="Command Palette"
				description="Type to search pages, anomalies, or run a quick action."
				className="sm:max-w-2xl"
			>
				<CommandInput placeholder="Search pages, anomalies, drafts…" />
				<CommandList className="max-h-[60vh]">
					<CommandEmpty>No matches found.</CommandEmpty>

					<CommandGroup heading="Navigate">
						{visibleNav.map(({ href, label, icon: Icon }) => (
							<CommandItem key={href} onSelect={() => go(href)}>
								<Icon className="mr-2 h-4 w-4" />
								{label}
							</CommandItem>
						))}
					</CommandGroup>

					{pendingDrafts.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Pending policy drafts">
								{pendingDrafts.map((d) => (
									<CommandItem
										key={d.draftId}
										value={`draft ${d.draftId} ${d.service}`}
										onSelect={() => go(`/policy-review?draft=${d.draftId}`)}
									>
										<Sparkles className="mr-2 h-4 w-4 text-primary" />
										<span className="font-mono text-xs mr-2">{d.draftId.slice(0, 8)}…</span>
										<span className="text-muted-foreground">{d.service}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}

					{recentAnomalies.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Recent anomalies">
								{recentAnomalies.map((a) => (
									<CommandItem
										key={a.anomalyId}
										value={`anomaly ${a.anomalyId} ${a.type} ${a.service}`}
										onSelect={() => go(`/anomalies/${a.anomalyId}`)}
									>
										<AlertTriangle className="mr-2 h-4 w-4 text-warning" />
										<span className="mr-2">{a.type}</span>
										<span className="text-muted-foreground text-xs">{a.service}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}

					<CommandSeparator />
					<CommandGroup heading="Help">
						<CommandItem
							onSelect={() => {
								setIsOpen(false);
								window.dispatchEvent(new CustomEvent("zentrion:show-shortcuts"));
							}}
						>
							<Keyboard className="mr-2 h-4 w-4" />
							Show keyboard shortcuts
							<span className="ml-auto text-xs text-muted-foreground font-mono">?</span>
						</CommandItem>
						<CommandItem
							onSelect={() => {
								setIsOpen(false);
								window.location.reload();
							}}
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh the app
						</CommandItem>
						<CommandItem onSelect={() => go("/auth/me")}>
							<CheckCircle2 className="mr-2 h-4 w-4" />
							My account
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</CommandPaletteContext.Provider>
	);
}
