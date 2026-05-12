"use client";

import { useSocket } from "@/hooks/useSocket";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ConnectionDot() {
	const { connected } = useSocket();
	const label = connected ? "Connected to orchestrator" : "Disconnected — trying to reconnect…";
	const dotClass = connected ? "bg-success" : "bg-destructive";
	const ringClass = connected ? "bg-success/40" : "bg-destructive/40";

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						aria-label={label}
						className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-card/60"
					>
						<span className={`relative inline-block h-2 w-2 rounded-full ${dotClass}`}>
							{connected && (
								<span
									className={`absolute inset-0 rounded-full ${ringClass} animate-ping`}
									style={{ animationDuration: "2s" }}
								/>
							)}
						</span>
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
