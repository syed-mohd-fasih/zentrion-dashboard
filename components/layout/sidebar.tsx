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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
	{ href: "/dashboard", label: "Overview", icon: LayoutDashboard },
	{ href: "/policy-review", label: "Policy Review", icon: FileText },
	{ href: "/access-control", label: "Access Control", icon: Users },
	{ href: "/services", label: "Services", icon: Server },
	{ href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
	{ href: "/history", label: "Audit Log", icon: History },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<>
			{/* Mobile Toggle */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed top-4 left-4 z-50 md:hidden"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</Button>

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 z-40 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} md:translate-x-0 flex flex-col`}
			>
				{/* Logo */}
				<div className="h-16 flex items-center justify-center border-b border-border">
					<div className="text-2xl font-bold text-primary">Zentrion</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<Link key={item.href} href={item.href}>
								<Button
									variant={isActive ? "default" : "ghost"}
									className="w-full justify-start gap-3 rounded-lg"
									onClick={() => setIsOpen(false)}
								>
									<Icon className="w-5 h-5" />
									<span>{item.label}</span>
								</Button>
							</Link>
						);
					})}
				</nav>

				{/* User + logout */}
				<div className="px-4 py-4 border-t border-border space-y-3">
					{user && (
						<div className="text-xs text-muted-foreground">
							<p className="font-semibold text-foreground truncate">{user.username}</p>
							<p className="truncate">{user.role}</p>
						</div>
					)}
					<Button
						variant="ghost"
						onClick={handleLogout}
						className="w-full justify-start gap-3 rounded-lg text-muted-foreground hover:text-foreground"
					>
						<LogOut className="w-5 h-5" />
						<span>Sign out</span>
					</Button>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-border text-xs text-muted-foreground">
					<p>Zentrion v1.0.0</p>
				</div>
			</aside>

			{/* Mobile Overlay */}
			{isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
		</>
	);
}
