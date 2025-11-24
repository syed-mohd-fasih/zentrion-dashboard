import { MainLayout } from "@/components/layout/main-layout"
import { SystemConfig } from "@/components/settings/system-config"
import { AIEngine } from "@/components/settings/ai-engine"
import { Notifications } from "@/components/settings/notifications"
import { AboutSystem } from "@/components/settings/about-system"

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system parameters, AI engine, and preferences</p>
        </div>

        {/* Settings Grid */}
        <div className="space-y-8">
          {/* System Configuration */}
          <section>
            <SystemConfig />
          </section>

          {/* AI Engine Settings */}
          <section>
            <AIEngine />
          </section>

          {/* Notification Preferences */}
          <section>
            <Notifications />
          </section>

          {/* About & System Info */}
          <section>
            <AboutSystem />
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
