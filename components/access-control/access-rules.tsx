import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const accessRules = {
  admin: {
    description: "Full system access and administrative privileges",
    permissions: [
      "View all logs and anomalies",
      "Create and modify policies",
      "Manage user accounts and roles",
      "Configure system settings",
      "Access audit trails",
      "Export system reports",
    ],
  },
  developer: {
    description: "Application development and service management",
    permissions: [
      "View relevant service logs",
      "Review policy suggestions",
      "Deploy service updates",
      "Configure service parameters",
      "Access monitoring dashboards",
    ],
  },
  auditor: {
    description: "Compliance monitoring and audit access",
    permissions: [
      "View audit logs (read-only)",
      "Review policy compliance reports",
      "Access compliance dashboards",
      "Generate compliance certificates",
      "Schedule audit scans",
    ],
  },
}

export function AccessRules() {
  return (
    <div className="space-y-4">
      {Object.entries(accessRules).map(([role, data]) => (
        <Card key={role} className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold capitalize">{role} Role</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.permissions.map((permission, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="text-primary mt-1">✓</span>
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
