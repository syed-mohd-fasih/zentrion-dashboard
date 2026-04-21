"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
// import Link from "next/link";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const router = useRouter();
	const { login, loading, error } = useAuth();
	// const [credentials, setCredentials] = useState({ username: "", password: "" });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await login(username, password);
			router.push("/dashboard");
		} catch (err) {
			// Error is already in state
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-md space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="text-3xl font-bold text-primary">Zentrion</div>
					<h1 className="text-2xl font-semibold text-foreground">Sign In</h1>
					<p className="text-muted-foreground">Enter your credentials to access the security platform</p>
					{error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
				</div>

				{/* Login Form */}
				<Card className="p-6 space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Username</label>
						<Input
							type="username"
							placeholder="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="rounded-lg"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Password</label>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="rounded-lg pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? "Hide password" : "Show password"}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</div>

					{/* <div className="flex items-center justify-between">
						<label className="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" className="rounded border-border" />
							<span className="text-sm text-muted-foreground">Remember me</span>
						</label>
						<Link href="#" className="text-sm text-primary hover:underline">
							Forgot password?
						</Link>
					</div> */}

					<Button
						onClick={handleSubmit}
						disabled={loading}
						className="w-full rounded-lg bg-primary hover:bg-primary/90"
					>
						{loading ? "Logging in..." : "Login"}
					</Button>
				</Card>
			</div>
		</div>
	);
}
