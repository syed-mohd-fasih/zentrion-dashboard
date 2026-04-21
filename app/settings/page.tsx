import { MainLayout } from "@/components/layout/main-layout";
import { ComingSoon } from "@/components/common/coming-soon";

export default function SettingsPage() {
	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-foreground">System Settings</h1>
					<p className="text-muted-foreground mt-1">
						Configure system parameters, AI engine, and preferences
					</p>
				</div>

				<ComingSoon description="System configuration, AI engine tuning, and notification preferences will be available in a future release." />
			</div>
		</MainLayout>
	);
}
