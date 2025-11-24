"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function Notifications() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [severity, setSeverity] = useState("medium")

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Configure how you receive system alerts</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Alerts */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
          <div>
            <Label className="text-foreground font-medium">Email Alerts</Label>
            <p className="text-sm text-muted-foreground mt-1">Receive email notifications for critical events</p>
          </div>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        {/* Slack Webhook */}
        <div className="space-y-3 p-4 bg-muted rounded-xl">
          <Label className="text-foreground font-medium block">Slack Webhook URL</Label>
          <Input placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL" className="rounded-lg bg-background" />
          <p className="text-xs text-muted-foreground">Optional: Send alerts to a Slack channel</p>
        </div>

        {/* Severity Threshold */}
        <div className="space-y-3 p-4 bg-muted rounded-xl">
          <Label className="text-foreground font-medium block">Alert Severity Threshold</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="low">Low and above</SelectItem>
              <SelectItem value="medium">Medium and above</SelectItem>
              <SelectItem value="high">High only</SelectItem>
              <SelectItem value="critical">Critical only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only receive notifications for anomalies above this severity level
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
