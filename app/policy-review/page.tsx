import { MainLayout } from "@/components/layout/main-layout"
import { PolicyStageTabs } from "@/components/policy/policy-stage-tabs"

export default function PolicyReviewPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Policy Review Workflow</h1>
          <p className="text-muted-foreground mt-1">Review and approve AI-generated security policies</p>
        </div>

        {/* Workflow Tabs */}
        <PolicyStageTabs />
      </div>
    </MainLayout>
  )
}
