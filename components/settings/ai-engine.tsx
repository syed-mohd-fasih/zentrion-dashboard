"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export function AIEngine() {
  const [modelVersion, setModelVersion] = useState("v3.2")
  const [sensitivity, setSensitivity] = useState([7])

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">AI Engine Settings</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Configure the AI policy generation engine</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Version */}
        <div className="space-y-3 p-4 bg-muted rounded-xl">
          <Label className="text-foreground font-medium block">Model Version</Label>
          <Select value={modelVersion} onValueChange={setModelVersion}>
            <SelectTrigger className="rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="v2.1">v2.1 (Legacy)</SelectItem>
              <SelectItem value="v3.0">v3.0 (Stable)</SelectItem>
              <SelectItem value="v3.2">v3.2 (Recommended)</SelectItem>
              <SelectItem value="v4.0-beta">v4.0-beta (Experimental)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select the AI model version for policy generation</p>
        </div>

        {/* Sensitivity Slider */}
        <div className="space-y-3 p-4 bg-muted rounded-xl">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Anomaly Sensitivity</Label>
            <span className="text-sm font-semibold text-primary">{sensitivity[0]}/10</span>
          </div>
          <Slider value={sensitivity} onValueChange={setSensitivity} min={1} max={10} step={1} className="rounded-lg" />
          <p className="text-xs text-muted-foreground">
            Higher values detect more anomalies but may increase false positives
          </p>
        </div>

        {/* Retrain Button */}
        <div className="p-4 bg-muted rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground font-medium">Model Training</Label>
              <p className="text-xs text-muted-foreground mt-1">Last retrain: 2025-01-20 03:15 UTC</p>
            </div>
            <Button variant="outline" className="rounded-lg bg-transparent">
              Retrain Model
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
