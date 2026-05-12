"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ShieldCheck,
	Activity,
	AlertTriangle,
	Sparkles,
	UserCog,
	ArrowRight,
	X,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type Slide = {
	icon: React.ComponentType<{ className?: string }>;
	eyebrow: string;
	title: string;
	body: string;
	visual: React.ReactNode;
};

const SLIDES: Slide[] = [
	{
		icon: ShieldCheck,
		eyebrow: "Welcome to Zentrion",
		title: "A control plane for your Istio mesh",
		body: "Zentrion watches every request flowing through your service mesh and surfaces the moment something looks off — no rules to write, no dashboards to build.",
		visual: (
			<div className="grid grid-cols-3 gap-3 w-full">
				{["productpage", "reviews", "details", "ratings", "auth", "checkout"].map((s) => (
					<div
						key={s}
						className="rounded-xl border border-border bg-card/60 px-3 py-3 text-xs font-mono text-muted-foreground flex items-center gap-2"
					>
						<span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
						{s}
					</div>
				))}
			</div>
		),
	},
	{
		icon: Activity,
		eyebrow: "Live telemetry",
		title: "Every request, in real time",
		body: "Stream Envoy access logs over WebSocket as they happen. The dashboard renders the live feed, request volume, and per-service health without polling.",
		visual: (
			<div className="space-y-1.5 w-full">
				{[
					{ s: "productpage", code: 200, ms: 12 },
					{ s: "reviews", code: 200, ms: 8 },
					{ s: "checkout", code: 500, ms: 124 },
					{ s: "ratings", code: 200, ms: 4 },
					{ s: "auth", code: 401, ms: 18 },
				].map((row, i) => (
					<div
						key={i}
						className={`px-3 py-1.5 rounded-md text-xs font-mono ${
							row.code >= 500
								? "border-l-2 border-destructive bg-destructive/[0.04]"
								: row.code >= 400
									? "border-l-2 border-warning bg-warning/[0.04]"
									: "border-l-2 border-transparent"
						}`}
					>
						<span className="text-muted-foreground/60">10:0{i + 2}:14</span>
						<span className="ml-2 font-semibold">{row.s}</span>
						<span
							className={`ml-2 font-semibold ${
								row.code >= 500
									? "text-destructive"
									: row.code >= 400
										? "text-warning"
										: "text-success"
							}`}
						>
							{row.code}
						</span>
						<span className="ml-2 text-muted-foreground/60">{row.ms}ms</span>
					</div>
				))}
			</div>
		),
	},
	{
		icon: AlertTriangle,
		eyebrow: "Detection → Draft",
		title: "Anomalies become policy drafts",
		body: "When rule-based detection (or your local ML model) flags suspicious traffic, Zentrion drafts an Istio AuthorizationPolicy that would have blocked it.",
		visual: (
			<div className="space-y-3 w-full">
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
					<div className="flex items-center gap-2 mb-1">
						<AlertTriangle className="w-4 h-4 text-destructive" />
						<span className="text-xs font-semibold text-destructive uppercase tracking-wide">
							Anomaly · Unauthorized access
						</span>
					</div>
					<p className="text-xs text-muted-foreground">
						12 consecutive 401s from <span className="font-mono">10.244.0.18</span> against{" "}
						<span className="font-mono">auth-service</span>.
					</p>
				</div>
				<div className="text-muted-foreground text-center text-xs">↓ generates ↓</div>
				<div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
					<div className="flex items-center gap-2 mb-1">
						<Sparkles className="w-4 h-4 text-primary" />
						<span className="text-xs font-semibold text-primary uppercase tracking-wide">
							Draft · DENY policy
						</span>
					</div>
					<p className="text-xs font-mono text-foreground/80">
						action: DENY · ipBlocks: [10.244.0.18/32]
					</p>
				</div>
			</div>
		),
	},
	{
		icon: Sparkles,
		eyebrow: "Human in the loop",
		title: "Review with an AI assistant",
		body: "Each draft opens with a chat assistant that explains the proposal in plain language. Ask follow-ups, run a sandbox simulation against historical traffic, then approve.",
		visual: (
			<div className="rounded-xl border border-border bg-card/60 p-4 space-y-2 w-full">
				<div className="flex gap-2 items-start">
					<div className="h-7 w-7 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center shrink-0">
						<Sparkles className="w-3.5 h-3.5 text-primary" />
					</div>
					<div className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed">
						This policy denies traffic from <span className="font-mono">10.244.0.18</span>. Expected
						impact: minimal — that IP issued only 401s in the last 24h.
					</div>
				</div>
				<div className="flex gap-2 items-start flex-row-reverse">
					<div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-semibold">
						A
					</div>
					<div className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs">
						Why DENY and not just rate-limit?
					</div>
				</div>
			</div>
		),
	},
	{
		icon: UserCog,
		eyebrow: "You're set",
		title: "Built around your role",
		body: "Admins approve and apply policies. Analysts generate drafts and dig into anomalies. Viewers see everything but can't change anything. Press ⌘K any time to jump around.",
		visual: (
			<div className="grid grid-cols-3 gap-3 w-full">
				{[
					{ role: "ADMIN", desc: "Approve & apply" },
					{ role: "ANALYST", desc: "Generate drafts" },
					{ role: "VIEWER", desc: "Read-only" },
				].map((r) => (
					<div
						key={r.role}
						className="rounded-xl border border-border bg-card/60 px-3 py-3 text-center"
					>
						<p className="text-xs font-mono font-semibold text-primary tracking-wide mb-1">
							{r.role}
						</p>
						<p className="text-[11px] text-muted-foreground">{r.desc}</p>
					</div>
				))}
			</div>
		),
	},
];

export function OnboardingTour() {
	const { user, markTourCompleted } = useAuth();
	const [step, setStep] = useState(0);
	const [closing, setClosing] = useState(false);

	if (!user || !user.firstLogin || closing) return null;

	const slide = SLIDES[step];
	const isLast = step === SLIDES.length - 1;
	const Icon = slide.icon;

	const complete = async () => {
		setClosing(true);
		await markTourCompleted();
	};

	const next = () => {
		if (isLast) {
			void complete();
		} else {
			setStep((s) => s + 1);
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.25 }}
				className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-xl flex items-center justify-center p-6"
			>
				{/* Ambient glows */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
					<div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
				</div>

				{/* Skip — top right */}
				<button
					type="button"
					onClick={complete}
					className="absolute top-6 right-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg px-3 py-1.5 hover:bg-card/60"
				>
					Skip <X className="w-4 h-4" />
				</button>

				<div className="relative w-full max-w-3xl">
					<AnimatePresence mode="wait">
						<motion.div
							key={step}
							initial={{ opacity: 0, x: 32 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -32 }}
							transition={{ duration: 0.3, ease: "easeOut" }}
							className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 md:p-12 shadow-[0_0_60px_-20px_var(--ring)]"
						>
							<div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
								<div className="space-y-5">
									<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 ring-1 ring-primary/20 text-xs font-mono uppercase tracking-wider text-primary">
										<Icon className="w-3.5 h-3.5" />
										{slide.eyebrow}
									</div>
									<h2 className="text-2xl md:text-3xl font-bold tracking-tight">
										{slide.title}
									</h2>
									<p className="text-muted-foreground leading-relaxed">{slide.body}</p>
								</div>
								<div className="flex items-center justify-center min-h-[180px]">
									{slide.visual}
								</div>
							</div>
						</motion.div>
					</AnimatePresence>

					{/* Footer: dots + next */}
					<div className="flex items-center justify-between mt-8 px-2">
						<div className="flex items-center gap-2">
							{SLIDES.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={() => setStep(i)}
									className={`h-1.5 rounded-full transition-all ${
										i === step ? "w-8 bg-primary" : "w-2 bg-border hover:bg-border/80"
									}`}
									aria-label={`Go to slide ${i + 1}`}
								/>
							))}
						</div>
						<div className="flex items-center gap-3">
							{step > 0 && (
								<Button
									variant="ghost"
									onClick={() => setStep((s) => Math.max(0, s - 1))}
									className="rounded-lg"
								>
									Back
								</Button>
							)}
							<Button onClick={next} className="rounded-lg gap-2">
								{isLast ? (
									<>
										<Check className="w-4 h-4" /> Get started
									</>
								) : (
									<>
										Next <ArrowRight className="w-4 h-4" />
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
