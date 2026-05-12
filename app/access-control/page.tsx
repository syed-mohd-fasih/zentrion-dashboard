"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	MoreHorizontal,
	Edit3,
	KeyRound,
	Trash2,
	Users as UsersIcon,
} from "lucide-react";
import {
	useUsers,
	useCreateUser,
	useUpdateUser,
	useDeleteUser,
	useResetUserPassword,
} from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { UserFormDialog } from "@/components/access-control/user-form-dialog";
import { DeleteUserConfirm } from "@/components/access-control/delete-user-confirm";
import { ResetPasswordDialog } from "@/components/access-control/reset-password-dialog";
import type { AdminUser, UserRole } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function roleBadge(role: UserRole) {
	const cls =
		role === "ADMIN"
			? "bg-primary/15 text-primary border-primary/30"
			: role === "ANALYST"
				? "bg-accent/15 text-accent border-accent/30"
				: "bg-muted/40 text-muted-foreground border-border";
	return <Badge className={cn("font-mono", cls)}>{role}</Badge>;
}

export default function AccessControlPage() {
	const { user: currentUser } = useAuth();
	const { data, loading, refetch } = useUsers();
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const deleteUser = useDeleteUser();
	const resetPassword = useResetUserPassword();

	const [formOpen, setFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
	const [resettingUser, setResettingUser] = useState<AdminUser | null>(null);

	const users = data?.users ?? [];

	const handleCreate = async (form: {
		username: string;
		email?: string;
		role: UserRole;
		password?: string;
	}) => {
		try {
			await createUser.mutate({
				username: form.username,
				role: form.role,
				email: form.email,
				password: form.password!,
			});
			toast.success("User created", { description: form.username });
			refetch();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to create user";
			toast.error("Couldn't create user", { description: msg });
			throw err;
		}
	};

	const handleUpdate = async (form: {
		username: string;
		email?: string;
		role: UserRole;
	}) => {
		if (!editingUser) return;
		try {
			await updateUser.mutate({
				id: editingUser.id,
				dto: {
					username: form.username,
					email: form.email,
					role: form.role,
				},
			});
			toast.success("User updated", { description: form.username });
			refetch();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to update user";
			toast.error("Couldn't update user", { description: msg });
			throw err;
		}
	};

	const handleDelete = async () => {
		if (!deletingUser) return;
		try {
			await deleteUser.mutate(deletingUser.id);
			toast.success("User deleted", { description: deletingUser.username });
			setDeletingUser(null);
			refetch();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to delete user";
			toast.error("Couldn't delete user", { description: msg });
		}
	};

	const handleReset = async (newPassword: string) => {
		if (!resettingUser) return;
		try {
			await resetPassword.mutate({ id: resettingUser.id, password: newPassword });
			toast.success("Password reset", {
				description: `${resettingUser.username}'s sessions were invalidated.`,
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to reset password";
			toast.error("Couldn't reset password", { description: msg });
			throw err;
		}
	};

	return (
		<MainLayout>
			<ProtectedRoute allowedRoles={["ADMIN"]}>
				<div className="p-6 space-y-6 max-w-[1400px] mx-auto">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-foreground">
								Access Control
							</h1>
							<p className="text-muted-foreground mt-1">
								Manage user accounts and their roles. Only admins can change these.
							</p>
						</div>
						<Button
							onClick={() => {
								setEditingUser(null);
								setFormOpen(true);
							}}
							className="rounded-lg gap-2"
						>
							<Plus className="w-4 h-4" />
							Add user
						</Button>
					</div>

					<Card className="overflow-hidden py-0">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-border/40">
										<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
											Username
										</th>
										<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
											Email
										</th>
										<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
											Role
										</th>
										<th className="px-6 py-3 text-left text-xs uppercase tracking-wider font-semibold text-muted-foreground">
											Created
										</th>
										<th className="px-6 py-3" />
									</tr>
								</thead>
								<tbody>
									{loading && users.length === 0 ? (
										[1, 2, 3].map((i) => (
											<tr key={i} className="border-b border-border/30">
												{[1, 2, 3, 4, 5].map((j) => (
													<td key={j} className="px-6 py-4">
														<Skeleton className="h-4 w-full max-w-[120px] rounded-md" />
													</td>
												))}
											</tr>
										))
									) : users.length === 0 ? (
										<tr>
											<td colSpan={5} className="px-6 py-4">
												<EmptyState
													icon={UsersIcon}
													title="No users yet"
													description="Add the first account to start onboarding your team."
												/>
											</td>
										</tr>
									) : (
										users.map((u, i) => {
											const isSelf = u.id === currentUser?.id;
											return (
												<motion.tr
													key={u.id}
													initial={{ opacity: 0, y: 4 }}
													animate={{ opacity: 1, y: 0 }}
													transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.2) }}
													className="border-b border-border/30 hover:bg-card/60 transition-colors"
												>
													<td className="px-6 py-3 text-sm font-medium text-foreground">
														<span className="flex items-center gap-2">
															{u.username}
															{isSelf && (
																<span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
																	you
																</span>
															)}
														</span>
													</td>
													<td className="px-6 py-3 text-sm text-muted-foreground">
														{u.email ?? <span className="text-muted-foreground/40">—</span>}
													</td>
													<td className="px-6 py-3">{roleBadge(u.role)}</td>
													<td className="px-6 py-3 text-xs font-mono text-muted-foreground">
														{new Date(u.createdAt).toLocaleDateString()}
													</td>
													<td className="px-6 py-3 text-right">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="icon-sm" className="rounded-lg">
																	<MoreHorizontal className="w-4 h-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem
																	onSelect={() => {
																		setEditingUser(u);
																		setFormOpen(true);
																	}}
																>
																	<Edit3 className="w-4 h-4 mr-2" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuItem onSelect={() => setResettingUser(u)}>
																	<KeyRound className="w-4 h-4 mr-2" />
																	Reset password
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onSelect={() => setDeletingUser(u)}
																	disabled={isSelf}
																	variant="destructive"
																>
																	<Trash2 className="w-4 h-4 mr-2" />
																	{isSelf ? "Can't delete yourself" : "Delete"}
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</td>
												</motion.tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</Card>

					<div className="text-xs text-muted-foreground font-mono">
						{users.length} {users.length === 1 ? "user" : "users"}
					</div>

					<UserFormDialog
						open={formOpen}
						onClose={() => {
							setFormOpen(false);
							setEditingUser(null);
						}}
						user={editingUser}
						onSubmit={editingUser ? handleUpdate : handleCreate}
					/>

					{deletingUser && (
						<DeleteUserConfirm
							open={!!deletingUser}
							onOpenChange={(open) => !open && setDeletingUser(null)}
							username={deletingUser.username}
							onConfirm={handleDelete}
							loading={deleteUser.loading}
						/>
					)}

					{resettingUser && (
						<ResetPasswordDialog
							open={!!resettingUser}
							onClose={() => setResettingUser(null)}
							username={resettingUser.username}
							onSubmit={handleReset}
						/>
					)}
				</div>
			</ProtectedRoute>
		</MainLayout>
	);
}
