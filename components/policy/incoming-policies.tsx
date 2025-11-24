"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const policies = [
  {
    id: 1,
    name: "API Rate Limiting Policy",
    service: "API Gateway",
    severity: "High",
    status: "Pending",
    timestamp: "2025-01-24 14:22:11",
  },
  {
    id: 2,
    name: "Authentication Timeout",
    service: "Auth Service",
    severity: "Medium",
    status: "Pending",
    timestamp: "2025-01-24 13:15:44",
  },
  {
    id: 3,
    name: "Data Encryption Standard",
    service: "Database",
    severity: "High",
    status: "Approved",
    timestamp: "2025-01-24 12:08:32",
  },
  {
    id: 4,
    name: "Cache TTL Policy",
    service: "Cache Layer",
    severity: "Low",
    status: "Rejected",
    timestamp: "2025-01-24 11:42:19",
  },
  {
    id: 5,
    name: "Request Validation Rules",
    service: "API Gateway",
    severity: "Medium",
    status: "Pending",
    timestamp: "2025-01-24 10:55:07",
  },
]

const statusColor = {
  Pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const severityColor = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

export function IncomingPolicies() {
  const [severityFilter, setSeverityFilter] = useState("all")

  const filtered = severityFilter === "all" ? policies : policies.filter((p) => p.severity === severityFilter)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-col md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Search Policies</label>
              <Input placeholder="Search by name or service..." className="rounded-lg" />
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="space-y-3">
        {filtered.map((policy) => (
          <Card
            key={policy.id}
            className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">{policy.name}</h3>
                  <div className="flex gap-2 items-center mt-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">{policy.service}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{policy.timestamp}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge className={`rounded-lg ${severityColor[policy.severity as keyof typeof severityColor]}`}>
                    {policy.severity}
                  </Badge>
                  <Badge className={`rounded-lg ${statusColor[policy.status as keyof typeof statusColor]}`}>
                    {policy.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
