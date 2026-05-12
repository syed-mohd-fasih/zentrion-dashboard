"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminUser, UserRole } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface UserFormDialogProps {
	open: boolean;
	onClose: () => void;
	/** When provided, the dialog is in edit mode and password is hidden. */
	user?: AdminUser | null;
	onSubmit: (data: {
		username: string;
		email?: string;
		role: UserRole;
		password?: string;
	}) => Promise<void>;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
	{ value: "ADMIN", label: "Admin", description: "Full access — manage users, approve & apply policies" },
	{ value: "ANALYST", label: "Analyst", description: "Generate drafts, reject, manage settings" },
	{ value: "VIEWER", label: "Viewer", description: "Read-only across all dashboards" },
];

export function UserFormDialog({ open, onClose, user, onSubmit }: UserFormDialogProps) {
	const isEdit = !!user;
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<UserRole>("VIEWER");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setUsername(user?.username ?? "");
		setEmail(user?.email ?? "");
		setRole(user?.role ?? "VIEWER");
		setPassword("");
		setError(null);
	}, [open, user]);

	const validate = (): string | null => {
		if (username.trim().length < 3) return "Username must be at least 3 characters";
		if (!isEdit && password.length < 8) return "Password must be at least 8 characters";
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const err = validate();
		if (err) {
			setError(err);
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await onSubmit({
				username: username.trim(),
				email: email.trim() || undefined,
				role,
				...(isEdit ? {} : { password }),
			});
			onClose();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to save";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit user" : "Add user"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the user's username, email, or role."
							: "Create a new account. The user will be asked to walk through the onboarding tour on first sign-in."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="username" className="text-sm font-medium text-foreground">
							Username
						</label>
						<Input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="e.g. alex"
							autoComplete="off"
							required
						/>
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium text-foreground">
							Email <span className="text-muted-foreground font-normal">(optional)</span>
						</label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="alex@zentrion.io"
							autoComplete="off"
						/>
					</div>

					{!isEdit && (
						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium text-foreground">
								Password
							</label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="At least 8 characters"
								autoComplete="new-password"
								required
							/>
						</div>
					)}

					<div className="space-y-2">
						<p className="text-sm font-medium text-foreground">Role</p>
						<div className="grid gap-2">
							{ROLES.map((r) => (
								<label
									key={r.value}
									className={cn(
										"cursor-pointer rounded-xl border p-3 transition-colors",
										role === r.value
											? "border-primary/60 bg-primary/[0.06]"
											: "border-border hover:border-primary/30 hover:bg-card/60",
									)}
								>
									<div className="flex items-start gap-3">
										<input
											type="radio"
											name="role"
											value={r.value}
											checked={role === r.value}
											onChange={() => setRole(r.value)}
											className="mt-1 accent-primary"
										/>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<Badge
													className={cn(
														"font-mono",
														r.value === "ADMIN"
															? "bg-primary/15 text-primary border-primary/30"
															: r.value === "ANALYST"
																? "bg-accent/15 text-accent border-accent/30"
																: "bg-muted/40 text-muted-foreground border-border",
													)}
												>
													{r.label}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground mt-1">{r.description}</p>
										</div>
									</div>
								</label>
							))}
						</div>
					</div>

					{error && (
						<div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
							{error}
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Saving…
								</>
							) : isEdit ? (
								"Save changes"
							) : (
								"Create user"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
