import { MainLayout } from "@/components/layout/main-layout"
import { PolicyStageTabs } from "@/components/policy/policy-stage-tabs"

export default function PolicyReviewPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Policy Review</h1>
          <p className="text-muted-foreground mt-1">
            Review, simulate, and approve policy drafts generated from detected anomalies.
          </p>
        </div>

        <PolicyStageTabs />
      </div>
    </MainLayout>
  )
}
