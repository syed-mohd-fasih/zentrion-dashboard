import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function PolicySummary() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">API Rate Limiting Policy</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Service: API Gateway | Generated: 2025-01-24 14:22:11</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Policy Overview</h4>
            <Textarea
              readOnly
              className="rounded-xl bg-muted border-0"
              rows={6}
              value={`This policy implements a comprehensive rate limiting strategy for the API Gateway to prevent abuse and ensure fair resource allocation among users.

Key Components:
• Rate limiting threshold: 1000 requests per minute per user
• Burst allowance: up to 50 requests in a 5-second window
• Backoff strategy: exponential retry-after headers
• Whitelist: internal services and premium tier users

Benefits:
• Protects against DDoS attacks and brute force attempts
• Ensures fair service distribution across all users
• Improves overall API reliability and performance
• Reduces infrastructure costs by preventing resource exhaustion`}
            />
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Implementation Details</h4>
            <Textarea
              readOnly
              className="rounded-xl bg-muted border-0"
              rows={4}
              value={`Location: middleware/rate-limiter.ts
Dependencies: redis-client, moment.js
Environment Variables: RATE_LIMIT_ENABLED, RATE_LIMIT_THRESHOLD, RATE_LIMIT_WINDOW

This policy will be automatically enforced upon approval.`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
