"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const router = useRouter();
	const { login, loading, error } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await login(username, password);
			router.push("/dashboard");
		} catch {
			// Error is surfaced via the `error` state from useAuth.
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
			{/* Ambient glow */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="w-full max-w-md space-y-6 relative"
			>
				{/* Brand */}
				<div className="text-center space-y-3">
					<div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/15 ring-1 ring-primary/30">
						<ShieldCheck className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
						Zentrion
					</h1>
					<p className="text-sm text-muted-foreground">
						Sign in to your security control plane
					</p>
				</div>

				<Card className="p-6 space-y-5 backdrop-blur-sm">
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<label htmlFor="username" className="text-sm font-medium text-foreground">
								Username
							</label>
							<Input
								id="username"
								type="text"
								placeholder="admin"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								autoComplete="username"
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium text-foreground">
								Password
							</label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									required
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: -4 }}
								animate={{ opacity: 1, y: 0 }}
								className="text-sm rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2"
							>
								{error}
							</motion.div>
						)}

						<Button
							type="submit"
							disabled={loading || !username || !password}
							className="w-full rounded-lg"
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Signing in…
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>
				</Card>

				<p className="text-center text-xs text-muted-foreground/60 font-mono uppercase tracking-widest">
					Local mode · v1.0
				</p>
			</motion.div>
		</div>
	);
}
