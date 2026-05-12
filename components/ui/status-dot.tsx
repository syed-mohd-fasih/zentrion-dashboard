import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "destructive" | "muted" | "primary";

const TONE_BG: Record<StatusTone, string> = {
	success: "bg-success",
	warning: "bg-warning",
	destructive: "bg-destructive",
	muted: "bg-muted-foreground",
	primary: "bg-primary",
};

const TONE_RING: Record<StatusTone, string> = {
	success: "bg-success/40",
	warning: "bg-warning/40",
	destructive: "bg-destructive/40",
	muted: "bg-muted-foreground/40",
	primary: "bg-primary/40",
};

export function StatusDot({
	tone = "primary",
	pulse = false,
	className,
}: {
	tone?: StatusTone;
	pulse?: boolean;
	className?: string;
}) {
	return (
		<span className={cn("relative inline-flex items-center justify-center", className)}>
			<span className={cn("relative inline-block h-2 w-2 rounded-full", TONE_BG[tone])}>
				{pulse && (
					<span
						className={cn("absolute inset-0 rounded-full animate-ping", TONE_RING[tone])}
						style={{ animationDuration: "2s" }}
					/>
				)}
			</span>
		</span>
	);
}
