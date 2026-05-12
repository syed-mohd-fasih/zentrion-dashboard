"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/api/services";
import { ChevronDown, Loader2, Mail, User as UserIcon, Calendar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

function initialsOf(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MePage() {
	const { user, checkAuth, loading: authLoading } = useAuth();

	// Profile form state
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [saving, setSaving] = useState(false);

	// Password form state
	const [showPasswordPanel, setShowPasswordPanel] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);

	useEffect(() => {
		if (user) {
			setUsername(user.username);
			setEmail(user.email ?? "");
		}
	}, [user]);

	if (authLoading || !user) {
		return (
			<MainLayout>
				<div className="p-6 max-w-5xl mx-auto">
					<Skeleton className="h-8 w-40 mb-6" />
					<Card className="p-8">
						<div className="flex gap-8">
							<Skeleton className="h-28 w-28 rounded-2xl" />
							<div className="flex-1 space-y-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-6 w-32" />
							</div>
						</div>
					</Card>
				</div>
			</MainLayout>
		);
	}

	const isDirty = username !== user.username || (email || "") !== (user.email ?? "");

	const handleSaveProfile = async () => {
		if (!isDirty) return;
		setSaving(true);
		try {
			const patch: { username?: string; email?: string } = {};
			if (username !== user.username) patch.username = username;
			if (email !== (user.email ?? "")) patch.email = email;
			await authService.updateProfile(patch);
			toast.success("Profile updated");
			await checkAuth();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to update profile";
			toast.error("Couldn't save profile", { description: msg });
		} finally {
			setSaving(false);
		}
	};

	const handleSavePassword = async () => {
		if (newPassword.length < 8) {
			toast.error("Password too short", { description: "Must be at least 8 characters." });
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}
		setSavingPassword(true);
		try {
			await authService.changePassword(currentPassword, newPassword);
			toast.success("Password changed");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setShowPasswordPanel(false);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to change password";
			toast.error("Couldn't change password", { description: msg });
		} finally {
			setSavingPassword(false);
		}
	};

	return (
		<MainLayout>
			<div className="p-6 max-w-5xl mx-auto space-y-6">
				<motion.div
					initial={{ opacity: 0, y: -4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25 }}
				>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Your account</h1>
					<p className="text-muted-foreground mt-1">
						Manage how you sign in and what we display.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<Card className="p-6 md:p-8">
						<div className="flex flex-col md:flex-row gap-6 md:gap-10">
							{/* Avatar */}
							<div className="flex flex-col items-center gap-3 shrink-0">
								<div className="relative h-28 w-28 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
									{initialsOf(user.username)}
									<span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-card" />
								</div>
								<Badge
									className={cn(
										"font-mono",
										user.role === "ADMIN"
											? "bg-primary/15 text-primary border-primary/30"
											: user.role === "ANALYST"
												? "bg-accent/15 text-accent border-accent/30"
												: "bg-muted/40 text-muted-foreground border-border",
									)}
								>
									{user.role}
								</Badge>
							</div>

							{/* Editable fields */}
							<div className="flex-1 space-y-5">
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label
											htmlFor="username"
											className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
										>
											<UserIcon className="w-3.5 h-3.5" /> Username
										</label>
										<Input
											id="username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											autoComplete="off"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="email"
											className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
										>
											<Mail className="w-3.5 h-3.5" /> Email
										</label>
										<Input
											id="email"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="you@example.com"
											autoComplete="off"
										/>
									</div>

									<div className="space-y-1">
										<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
											<ShieldCheck className="w-3.5 h-3.5" /> Role
										</p>
										<p className="text-sm text-muted-foreground">
											{user.role === "ADMIN"
												? "Full access — manage users, approve & apply policies."
												: user.role === "ANALYST"
													? "Generate drafts, reject, manage settings."
													: "Read-only access."}
										</p>
									</div>

									<div className="space-y-1">
										<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5" /> Joined
										</p>
										<p className="text-sm text-foreground font-mono">
											{user.createdAt
												? new Date(user.createdAt).toLocaleDateString()
												: "—"}
										</p>
									</div>
								</div>

								{/* Action row */}
								<div className="flex items-center justify-between pt-2 border-t border-border/40">
									<Button
										type="button"
										variant="ghost"
										onClick={() => setShowPasswordPanel((v) => !v)}
										className="gap-2 rounded-lg"
									>
										<ChevronDown
											className={cn(
												"w-4 h-4 transition-transform",
												showPasswordPanel && "rotate-180",
											)}
										/>
										Change password
									</Button>

									<div className="flex items-center gap-2">
										{isDirty && (
											<Button
												type="button"
												variant="ghost"
												onClick={() => {
													setUsername(user.username);
													setEmail(user.email ?? "");
												}}
												disabled={saving}
											>
												Cancel
											</Button>
										)}
										<Button
											type="button"
											onClick={handleSaveProfile}
											disabled={!isDirty || saving}
										>
											{saving ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Saving…
												</>
											) : (
												"Save changes"
											)}
										</Button>
									</div>
								</div>

								{/* Password disclosure */}
								<AnimatePresence initial={false}>
									{showPasswordPanel && (
										<motion.div
											key="pwd"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2 }}
											className="overflow-hidden"
										>
											<div className="pt-2 space-y-3">
												<div className="grid sm:grid-cols-3 gap-3">
													<div className="space-y-1.5">
														<label className="text-xs font-medium text-foreground">
															Current password
														</label>
														<Input
															type="password"
															value={currentPassword}
															onChange={(e) => setCurrentPassword(e.target.value)}
															autoComplete="current-password"
														/>
													</div>
													<div className="space-y-1.5">
														<label className="text-xs font-medium text-foreground">
															New password
														</label>
														<Input
															type="password"
															value={newPassword}
															onChange={(e) => setNewPassword(e.target.value)}
															autoComplete="new-password"
														/>
													</div>
													<div className="space-y-1.5">
														<label className="text-xs font-medium text-foreground">
															Confirm new
														</label>
														<Input
															type="password"
															value={confirmPassword}
															onChange={(e) => setConfirmPassword(e.target.value)}
															autoComplete="new-password"
														/>
													</div>
												</div>
												<div className="flex justify-end gap-2">
													<Button
														variant="ghost"
														onClick={() => {
															setShowPasswordPanel(false);
															setCurrentPassword("");
															setNewPassword("");
															setConfirmPassword("");
														}}
														disabled={savingPassword}
													>
														Cancel
													</Button>
													<Button
														onClick={handleSavePassword}
														disabled={
															savingPassword ||
															!currentPassword ||
															!newPassword ||
															!confirmPassword
														}
													>
														{savingPassword ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Updating…
															</>
														) : (
															"Update password"
														)}
													</Button>
												</div>
												<p className="text-xs text-muted-foreground">
													Changing your password will sign you out of any other active sessions.
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
					</Card>
				</motion.div>
			</div>
		</MainLayout>
	);
}
