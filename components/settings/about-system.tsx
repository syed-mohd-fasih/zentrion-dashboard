import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const changelog = [
  {
    version: "1.0.0",
    date: "2025-01-20",
    items: [
      "Initial release of Zentrion dashboard",
      "Policy review workflow implemented",
      "AI policy generation engine v3.2",
      "Full dark mode support",
    ],
  },
  {
    version: "0.9.0",
    date: "2025-01-15",
    items: ["Beta release", "Core dashboard features", "User management system", "Settings configuration"],
  },
]

export function AboutSystem() {
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-semibold text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Release Date</span>
            <span className="text-sm font-semibold text-foreground">2025-01-20</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Build</span>
            <span className="text-sm font-semibold text-foreground">2025.01.20-prod</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Environment</span>
            <span className="text-sm font-semibold text-foreground">Production</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Changelog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {changelog.map((item) => (
            <div key={item.version} className="p-4 bg-muted rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">v{item.version}</h4>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <ul className="space-y-1">
                {item.items.map((change, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
