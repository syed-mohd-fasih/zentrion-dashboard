import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const anomalies = [
  {
    id: 1,
    timestamp: "2025-01-24 14:32:15",
    service: "API Gateway",
    severity: "High",
    description: "Unusual spike in error rates detected",
  },
  {
    id: 2,
    timestamp: "2025-01-24 13:45:02",
    service: "Auth Service",
    severity: "Medium",
    description: "Failed authentication attempts increased by 45%",
  },
  {
    id: 3,
    timestamp: "2025-01-24 12:18:47",
    service: "Database",
    severity: "Low",
    description: "Query performance degradation observed",
  },
  {
    id: 4,
    timestamp: "2025-01-24 11:05:22",
    service: "Cache Layer",
    severity: "Medium",
    description: "Cache hit ratio dropped below threshold",
  },
]

const severityColor = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

export function AnomaliesTable() {
  return (
    <Card className="rounded-2xl border-0 shadow-sm col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Anomalies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly) => (
                <tr key={anomaly.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 text-foreground">{anomaly.timestamp}</td>
                  <td className="py-4 px-4 text-foreground font-medium">{anomaly.service}</td>
                  <td className="py-4 px-4">
                    <Badge className={`rounded-lg ${severityColor[anomaly.severity as keyof typeof severityColor]}`}>
                      {anomaly.severity}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{anomaly.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
