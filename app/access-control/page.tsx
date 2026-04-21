import { MainLayout } from "@/components/layout/main-layout";
import { ComingSoon } from "@/components/common/coming-soon";

export default function AccessControlPage() {
	return (
		<MainLayout>
			<div className="p-6 space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-foreground">User & Access Control</h1>
					<p className="text-muted-foreground mt-1">
						Manage users, roles, and access permissions
					</p>
				</div>

				<ComingSoon description="User management and role-based access controls will be available in a future release. The backend currently operates with three seeded roles: ADMIN, ANALYST, and VIEWER." />
			</div>
		</MainLayout>
	);
}
