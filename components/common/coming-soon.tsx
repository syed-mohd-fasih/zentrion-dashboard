import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ComingSoonProps {
	title?: string;
	description?: string;
}

export function ComingSoon({
	title = "Coming Soon",
	description = "This feature is planned for a future release.",
}: ComingSoonProps) {
	return (
		<Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
			<div className="rounded-full bg-primary/10 p-4 text-primary">
				<Sparkles className="h-6 w-6" />
			</div>
			<h2 className="text-xl font-semibold text-foreground">{title}</h2>
			<p className="max-w-md text-sm text-muted-foreground">{description}</p>
		</Card>
	);
}
