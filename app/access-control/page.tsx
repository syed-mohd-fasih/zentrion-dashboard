import { MainLayout } from "@/components/layout/main-layout"
import { UsersTable } from "@/components/access-control/users-table"
import { AccessRules } from "@/components/access-control/access-rules"

export default function AccessControlPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">User & Access Control</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and access permissions</p>
        </div>

        {/* Users Table */}
        <UsersTable />

        {/* Access Control Rules */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Role Permissions</h2>
          <AccessRules />
        </div>
      </div>
    </MainLayout>
  )
}
