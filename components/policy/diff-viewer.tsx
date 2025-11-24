import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DiffViewer() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Configuration Diff</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-lg border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950 bg-transparent"
            >
              Approve
            </Button>
            <Button
              variant="outline"
              className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 bg-transparent"
            >
              Reject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 rounded-xl overflow-hidden border border-border">
            {/* Before */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 border-r border-border">
                <h4 className="font-mono text-sm font-semibold text-red-700 dark:text-red-400 mb-3">BEFORE</h4>
                <pre className="font-mono text-xs text-red-700 dark:text-red-400 whitespace-pre-wrap break-words">
                  {`{
  "rateLimit": {
    "enabled": false,
    "threshold": 10000,
    "window": 3600
  },
  "services": [
    "api-gateway"
  ]
}`}
                </pre>
              </div>

              {/* After */}
              <div className="bg-green-50 dark:bg-green-950/20 p-4">
                <h4 className="font-mono text-sm font-semibold text-green-700 dark:text-green-400 mb-3">AFTER</h4>
                <pre className="font-mono text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap break-words">
                  {`{
  "rateLimit": {
    "enabled": true,
    "threshold": 1000,
    "window": 60,
    "burst": 50
  },
  "services": [
    "api-gateway"
  ],
  "whitelist": ["premium-tier"]
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Changes Summary */}
          <div className="mt-6 p-4 bg-muted rounded-xl space-y-2">
            <h4 className="font-semibold text-foreground">Changes Summary</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="text-green-700 dark:text-green-400">+ Enabled rate limiting</li>
              <li className="text-green-700 dark:text-green-400">
                + Reduced threshold from 10000 to 1000 requests/min
              </li>
              <li className="text-green-700 dark:text-green-400">+ Reduced window from 3600s to 60s</li>
              <li className="text-green-700 dark:text-green-400">+ Added burst allowance of 50 requests</li>
              <li className="text-green-700 dark:text-green-400">+ Added whitelist for premium tier users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
