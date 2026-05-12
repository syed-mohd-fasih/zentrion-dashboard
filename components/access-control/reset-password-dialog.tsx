"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
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

interface ResetPasswordDialogProps {
	open: boolean;
	onClose: () => void;
	username: string;
	onSubmit: (newPassword: string) => Promise<void>;
}

function randomPassword(): string {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
	let out = "";
	const buf = new Uint8Array(16);
	if (typeof crypto !== "undefined") crypto.getRandomValues(buf);
	for (let i = 0; i < 16; i++) {
		out += alphabet[buf[i] % alphabet.length];
	}
	return out;
}

export function ResetPasswordDialog({ open, onClose, username, onSubmit }: ResetPasswordDialogProps) {
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (open) {
			setPassword(randomPassword());
			setError(null);
			setCopied(false);
		}
	}, [open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await onSubmit(password);
			onClose();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to reset password";
			setError(msg);
		} finally {
			setSubmitting(false);
		}
	};

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(password);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignored
		}
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reset password</DialogTitle>
					<DialogDescription>
						Set a new password for <span className="font-mono font-semibold">{username}</span>. All
						of their existing sessions will be invalidated.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="new-password" className="text-sm font-medium text-foreground">
							New password
						</label>
						<div className="flex gap-2">
							<Input
								id="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="font-mono"
								autoComplete="new-password"
							/>
							<Button type="button" variant="outline" size="icon" onClick={copy} className="shrink-0">
								{copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							A random 16-character password is pre-filled. Copy it before saving — it can't be
							retrieved later.
						</p>
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
									Resetting…
								</>
							) : (
								"Reset password"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
