"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	LayoutDashboard,
	FileText,
	Users,
	Settings,
	Menu,
	X,
	Server,
	AlertTriangle,
	History,
	LogOut,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { canSee } from "@/components/auth/ProtectedRoute";
import type { UserRole } from "@/lib/api/types";

interface NavItem {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
	{ href: "/dashboard", label: "Overview", icon: LayoutDashboard },
	{ href: "/policy-review", label: "Policy Review", icon: FileText },
	{ href: "/access-control", label: "Access Control", icon: Users, allowedRoles: ["ADMIN"] },
	{ href: "/services", label: "Services", icon: Server },
	{ href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
	{ href: "/history", label: "Audit Log", icon: History },
	{ href: "/settings", label: "Settings", icon: Settings, allowedRoles: ["ADMIN", "ANALYST"] },
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	const visibleItems = navItems.filter((item) => canSee(user?.role, item.allowedRoles));

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<TooltipProvider delayDuration={300}>
			{/* Mobile Toggle */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed top-4 left-4 z-50 md:hidden rounded-lg"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</Button>

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 flex flex-col`}
			>
				{/* Logo */}
				<div className="h-16 flex items-center justify-center border-b border-sidebar-border">
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.25 }}
						className="flex items-center gap-2"
					>
						<div className="relative">
							<div className="h-7 w-7 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
								<div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
							</div>
						</div>
						<span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
							Zentrion
						</span>
					</motion.div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
					{visibleItems.map((item, idx) => {
						const Icon = item.icon;
						const isActive =
							pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<motion.div
								key={item.href}
								initial={{ opacity: 0, x: -8 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.2, delay: idx * 0.04, ease: "easeOut" }}
							>
								<Link href={item.href} onClick={() => setIsOpen(false)}>
									<div
										className={cn(
											"relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
											isActive
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60",
										)}
									>
										{isActive && (
											<motion.span
												layoutId="sidebar-active-indicator"
												className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]"
												transition={{ duration: 0.2 }}
											/>
										)}
										<Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
										<span>{item.label}</span>
									</div>
								</Link>
							</motion.div>
						);
					})}
				</nav>

				{/* Account row: username left, sign-out icon right (destructive) */}
				{user && (
					<div className="px-4 py-3 border-t border-sidebar-border flex items-center justify-between gap-2">
						<div className="min-w-0 flex-1">
							<Link href="/auth/me" className="block">
								<p className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
									{user.username}
								</p>
							</Link>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={handleLogout}
									className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive hover:shadow-[0_0_18px_-6px_var(--destructive)]"
									aria-label="Sign out"
								>
									<LogOut className="w-4 h-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top" className="text-xs">
								Sign out
							</TooltipContent>
						</Tooltip>
					</div>
				)}

				{/* Footer */}
				<div className="px-4 py-3 border-t border-sidebar-border text-[10px] text-muted-foreground/70 uppercase tracking-widest text-center font-mono">
					Zentrion v1.0
				</div>
			</aside>

			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</TooltipProvider>
	);
}
