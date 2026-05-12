/**
 * ProtectedRoute
 *
 * - Redirects unauthenticated users to /login.
 * - Optionally restricts a page to a set of roles. ADMIN is always allowed.
 * - When access is denied, renders a branded "Access Denied" card instead
 *   of redirecting (keeps the URL stable so the user can navigate back).
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldOff, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/api/types";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
	redirectTo?: string;
}

export function canSee(role: UserRole | undefined, allowedRoles?: UserRole[]): boolean {
	if (!role) return false;
	if (!allowedRoles || allowedRoles.length === 0) return true;
	if (role === "ADMIN") return true; // ADMIN always sees everything
	return allowedRoles.includes(role);
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, user, loading } = useAuth();

	useEffect(() => {
		if (loading) return;
		if (!isAuthenticated) router.push(redirectTo);
	}, [isAuthenticated, loading, router, redirectTo]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	if (!canSee(user?.role, allowedRoles)) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-6">
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25 }}
					className="w-full max-w-md"
				>
					<Card className="p-8 text-center space-y-4">
						<div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 ring-1 ring-destructive/20 flex items-center justify-center">
							<ShieldOff className="h-5 w-5 text-destructive" />
						</div>
						<div className="space-y-1">
							<h1 className="text-lg font-semibold tracking-tight text-foreground">
								Access denied
							</h1>
							<p className="text-sm text-muted-foreground">
								Your role (<span className="font-mono uppercase">{user?.role}</span>) doesn't
								have access to this page.
							</p>
						</div>
						<div className="pt-2">
							<Link href="/dashboard">
								<Button variant="outline" className="rounded-lg gap-2">
									<ArrowLeft className="h-4 w-4" />
									Back to dashboard
								</Button>
							</Link>
						</div>
					</Card>
				</motion.div>
			</div>
		);
	}

	return <>{children}</>;
}

/**
 * Imperative role check for non-route gating (action buttons etc.).
 */
export function useRequireRole(requiredRole: UserRole): boolean {
	const { user } = useAuth();
	return user?.role === requiredRole || user?.role === "ADMIN";
}
