"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { healthService, settingsService } from "@/lib/api/services";
import type { HealthResponse, SystemSetting } from "@/lib/api/types";
import { Bot, ShieldCheck, Activity, Cpu, AlertCircle, CheckCircle2, XCircle, Save } from "lucide-react";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {ok ? "Online" : "Offline"}
    </span>
  );
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingMode, setSavingMode] = useState(false);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [savingWindow, setSavingWindow] = useState(false);
  const [windowHours, setWindowHours] = useState(24);
  const [confidenceRaw, setConfidenceRaw] = useState(0.7);

  const getSetting = useCallback(
    (key: string, fallback: string) => settings.find((s) => s.key === key)?.value ?? fallback,
    [settings]
  );

  const detectionMode = getSetting("detectionMode", "rules") as "rules" | "ai";
  const aiOnline = health?.ai?.ollama && health?.ai?.mlService;

  useEffect(() => {
    (async () => {
      try {
        const h = await healthService.check();
        setHealth(h);
      } catch {
        // health endpoint failed — keep null
      } finally {
        setLoadingHealth(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { settings: s } = await settingsService.getAll();
        setSettings(s);
        const threshold = s.find((x) => x.key === "aiConfidenceThreshold")?.value;
        if (threshold) setConfidenceRaw(parseFloat(threshold));
        const hours = s.find((x) => x.key === "sandboxWindowHours")?.value;
        if (hours) setWindowHours(parseInt(hours, 10));
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const updateSetting = async (
    key: string,
    value: string,
    setSaving: (v: boolean) => void,
    successMsg: string
  ) => {
    setSaving(true);
    try {
      const { setting } = await settingsService.update(key, value);
      setSettings((prev) => prev.map((s) => (s.key === key ? setting : s)));
      toast.success(successMsg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update setting";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleModeSwitch = (mode: "rules" | "ai") => {
    if (mode === detectionMode) return;
    updateSetting("detectionMode", mode, setSavingMode,
      mode === "ai" ? "Switched to AI-Powered detection" : "Switched to Rule-Based detection"
    );
  };

  const isLoading = loadingHealth || loadingSettings;

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="p-6 space-y-8 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure AI engine, detection mode, and analysis preferences
            </p>
          </div>

          {/* AI Service Health */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                AI Service Health
              </CardTitle>
              <CardDescription>Live status of the AI backend components</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-56" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-xl p-4 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">LLM (Ollama)</p>
                      <StatusDot ok={health?.ai?.ollama ?? false} />
                    </div>
                    <div className="bg-muted rounded-xl p-4 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">ML Service</p>
                      <StatusDot ok={health?.ai?.mlService ?? false} />
                    </div>
                    <div className="bg-muted rounded-xl p-4 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Mode</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        {health?.ai?.detectionMode === "ai" ? (
                          <><Bot className="w-4 h-4 text-blue-500" /> AI-Powered</>
                        ) : (
                          <><ShieldCheck className="w-4 h-4 text-green-500" /> Rule-Based</>
                        )}
                      </span>
                    </div>
                  </div>
                  {health?.ai?.model && (
                    <p className="text-xs text-muted-foreground">
                      Model: <span className="font-mono">{health.ai.model}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detection Mode */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Detection Mode
              </CardTitle>
              <CardDescription>
                Choose whether anomaly detection uses the rule engine or the trained ML model.
                Only one mode is active at a time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <Skeleton className="h-12 w-full rounded-xl" />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Button
                      variant={detectionMode === "rules" ? "default" : "outline"}
                      onClick={() => handleModeSwitch("rules")}
                      disabled={savingMode}
                      className="rounded-xl flex-1 sm:flex-none"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Rule-Based
                    </Button>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant={detectionMode === "ai" ? "default" : "outline"}
                            onClick={() => handleModeSwitch("ai")}
                            disabled={savingMode || !aiOnline}
                            className="rounded-xl flex-1 sm:flex-none"
                          >
                            <Bot className="w-4 h-4 mr-2" />
                            AI-Powered
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!aiOnline && (
                        <TooltipContent>
                          <p className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Both Ollama and ML Service must be online to enable AI detection
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {savingMode && <span className="text-sm text-muted-foreground">Saving…</span>}
                    {!isLoading && (
                      <Badge
                        className={`ml-auto rounded-lg ${
                          detectionMode === "ai"
                            ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                            : "bg-green-500/10 text-green-700 border-green-500/20"
                        }`}
                      >
                        {detectionMode === "ai" ? "AI active" : "Rules active"}
                      </Badge>
                    )}
                  </div>

                  {detectionMode === "ai" && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Confidence Threshold</p>
                          <p className="text-xs text-muted-foreground">
                            Minimum ML confidence score to raise an anomaly alert
                          </p>
                        </div>
                        <Badge variant="outline" className="font-mono rounded-lg">
                          {Math.round(confidenceRaw * 100)}%
                        </Badge>
                      </div>
                      <Slider
                        min={10}
                        max={99}
                        step={5}
                        value={[Math.round(confidenceRaw * 100)]}
                        onValueChange={([v]) => setConfidenceRaw(v / 100)}
                        className="w-full"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={savingThreshold}
                        onClick={() =>
                          updateSetting(
                            "aiConfidenceThreshold",
                            confidenceRaw.toFixed(2),
                            setSavingThreshold,
                            `Confidence threshold set to ${Math.round(confidenceRaw * 100)}%`
                          )
                        }
                      >
                        <Save className="w-3 h-3 mr-1" />
                        {savingThreshold ? "Saving…" : "Save threshold"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* LLM Configuration */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                LLM Configuration
              </CardTitle>
              <CardDescription>
                Settings for the local LLM used for policy explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-9 w-32" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">Model</p>
                    <p className="font-mono text-sm bg-muted rounded-lg px-3 py-2 inline-block">
                      {getSetting("llmModel", "qwen2.5:7b")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deployed in-cluster via Ollama. Change the model name in the orchestrator ConfigMap.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sandbox Window</p>
                    <p className="text-xs text-muted-foreground">
                      How many hours of historical traffic to evaluate when simulating a policy
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={168}
                        value={windowHours}
                        onChange={(e) => setWindowHours(parseInt(e.target.value, 10) || 24)}
                        className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        disabled={savingWindow}
                        onClick={() =>
                          updateSetting(
                            "sandboxWindowHours",
                            String(windowHours),
                            setSavingWindow,
                            `Sandbox window set to ${windowHours}h`
                          )
                        }
                      >
                        <Save className="w-3 h-3 mr-1" />
                        {savingWindow ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
}
