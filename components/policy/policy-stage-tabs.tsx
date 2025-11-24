import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncomingPolicies } from "./incoming-policies"
import { PolicySummary } from "./policy-summary"
import { DiffViewer } from "./diff-viewer"

export function PolicyStageTabs() {
  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted p-1">
        <TabsTrigger value="incoming" className="rounded-lg">
          Stage 1: Incoming
        </TabsTrigger>
        <TabsTrigger value="summary" className="rounded-lg">
          Stage 2: Summary
        </TabsTrigger>
        <TabsTrigger value="diff" className="rounded-lg">
          Stage 3: Review
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="mt-6">
        <IncomingPolicies />
      </TabsContent>

      <TabsContent value="summary" className="mt-6">
        <PolicySummary />
      </TabsContent>

      <TabsContent value="diff" className="mt-6">
        <DiffViewer />
      </TabsContent>
    </Tabs>
  )
}
