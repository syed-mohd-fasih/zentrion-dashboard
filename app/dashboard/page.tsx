"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { AnomaliesTable } from "@/components/dashboard/anomalies-table"
import { Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Logs Processed"
            value="2.4M"
            subtitle="+12% from yesterday"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatsCard
            title="Anomalies Detected"
            value="48"
            subtitle="Today"
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <StatsCard
            title="Policy Compliance Score"
            value="94.2%"
            subtitle="Excellent"
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatsCard title="Active Services" value="12" subtitle="All operational" icon={<Zap className="w-5 h-5" />} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartPlaceholder title="Service Health Over Time" description="Last 24 hours" height="h-80" />
          </div>
          <ChartPlaceholder title="Traffic Volume" description="Request distribution" height="h-80" />
        </div>

        {/* Anomalies Table */}
        <AnomaliesTable />
      </div>
    </MainLayout>
  )
}
