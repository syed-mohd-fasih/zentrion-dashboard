"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function SystemConfig() {
  const [logIngestion, setLogIngestion] = useState(true)
  const [updateFrequency, setUpdateFrequency] = useState("15s")

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">System Configuration</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Core system settings and service connectivity</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Log Ingestion Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
          <div>
            <Label className="text-foreground font-medium">Log Ingestion</Label>
            <p className="text-sm text-muted-foreground mt-1">Enable or disable log collection from services</p>
          </div>
          <Switch checked={logIngestion} onCheckedChange={setLogIngestion} />
        </div>

        {/* Service Mesh Connection */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
          <div>
            <Label className="text-foreground font-medium">Service Mesh Connection</Label>
            <p className="text-sm text-muted-foreground mt-1">Status of connection to service mesh</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Connected</span>
          </div>
        </div>

        {/* Update Frequency */}
        <div className="space-y-3 p-4 bg-muted rounded-xl">
          <Label className="text-foreground font-medium block">Update Frequency</Label>
          <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
            <SelectTrigger className="rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="5s">5 seconds</SelectItem>
              <SelectItem value="15s">15 seconds</SelectItem>
              <SelectItem value="60s">1 minute</SelectItem>
              <SelectItem value="300s">5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How often the system checks for updates and processes anomalies
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
