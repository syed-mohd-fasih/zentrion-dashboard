/**
 * ProtectedRoute Component
 * Redirects to login if user is not authenticated
 * Optional role-based access control
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: "ADMIN" | "ANALYST" | "VIEWER";
	redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
	const router = useRouter();
	const { isAuthenticated, user, loading } = useAuth();

	useEffect(() => {
		if (loading) return;

		if (!isAuthenticated) {
			router.push(redirectTo);
			return;
		}

		// Check role if required
		if (requiredRole && user?.role !== requiredRole) {
			// For ADMIN-only routes, redirect non-admins
			if (requiredRole === "ADMIN" && user?.role !== "ADMIN") {
				router.push("/dashboard");
				return;
			}
		}
	}, [isAuthenticated, user, loading, requiredRole, router, redirectTo]);

	// Show loading state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	// Don't render children until auth is confirmed
	if (!isAuthenticated) {
		return null;
	}

	// Check role permission
	if (requiredRole && user?.role !== requiredRole) {
		if (requiredRole === "ADMIN" && user?.role !== "ADMIN") {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
						<p className="mt-2 text-gray-600">You don&apos;t have permission to access this page.</p>
					</div>
				</div>
			);
		}
	}

	return <>{children}</>;
}

/**
 * Hook to check if user has required role
 */
export function useRequireRole(requiredRole: "ADMIN" | "ANALYST" | "VIEWER") {
	const { user } = useAuth();
	return user?.role === requiredRole || user?.role === "ADMIN";
}
