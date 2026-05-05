"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, FlaskConical, ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useSimulateDraft } from "@/hooks/useData";
import type { SandboxResult } from "@/lib/api/types";

interface SimulateModalProps {
  draftId: string;
  open: boolean;
  onClose: () => void;
}

function ScoreBar({
  label,
  value,
  thresholds,
}: {
  label: string;
  value: number;
  thresholds: { green: (v: number) => boolean; yellow: (v: number) => boolean };
}) {
  const color = thresholds.green(value)
    ? "text-green-600 dark:text-green-400"
    : thresholds.yellow(value)
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400";

  const barColor = thresholds.green(value)
    ? "[&>div]:bg-green-500"
    : thresholds.yellow(value)
    ? "[&>div]:bg-yellow-500"
    : "[&>div]:bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold text-base ${color}`}>{value}%</span>
      </div>
      <Progress value={value} className={`h-2 ${barColor}`} />
    </div>
  );
}

export function SimulateModal({ draftId, open, onClose }: SimulateModalProps) {
  const simulate = useSimulateDraft();
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [ran, setRan] = useState(false);

  const handleRun = async () => {
    try {
      const res = await simulate.mutate({ id: draftId });
      setResult(res.result);
      setRan(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Simulation failed";
      toast.error("Simulation failed", { description: msg });
    }
  };

  const handleClose = () => {
    setResult(null);
    setRan(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-500" />
            Policy Sandbox Simulation
          </DialogTitle>
          <DialogDescription>
            Evaluates this policy against recent traffic logs to estimate its impact before applying.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {!ran && !simulate.loading && (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center space-y-4">
              <FlaskConical className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium">Ready to simulate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Zentrion will evaluate this policy against the last 24 hours of traffic logs and show you what would be blocked.
                </p>
              </div>
              <Button onClick={handleRun} className="rounded-xl">
                <FlaskConical className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
            </div>
          )}

          {simulate.loading && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Evaluating policy against traffic logs…</p>
            </div>
          )}

          {ran && result && (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{result.totalLogsEvaluated.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Logs evaluated</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                    <ShieldOff className="w-5 h-5" />
                    {result.wouldBlock.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Would be blocked</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-5 h-5" />
                    {result.wouldAllow.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Would be allowed</p>
                </div>
              </div>

              {result.anomalyLogsBlocked > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 p-3">
                  <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">{result.anomalyLogsBlocked}</span> anomaly-associated logs would be blocked by this policy.
                  </p>
                </div>
              )}

              {/* Score bars */}
              <div className="space-y-4 bg-muted/40 rounded-xl p-4">
                <ScoreBar
                  label="Effectiveness Score"
                  value={result.effectivenessScore}
                  thresholds={{
                    green: (v) => v > 70,
                    yellow: (v) => v >= 40,
                  }}
                />
                <ScoreBar
                  label="False Positive Risk"
                  value={result.falsePositiveRisk}
                  thresholds={{
                    green: (v) => v < 20,
                    yellow: (v) => v <= 50,
                  }}
                />
              </div>

              {/* Blocked traffic table */}
              {result.wouldBlock.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Traffic that would be blocked</p>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Source IP</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Method</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Path</th>
                            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Service</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.wouldBlock.slice(0, 100).map((entry) => (
                            <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-3 py-1.5 font-mono">{entry.sourceIp}</td>
                              <td className="px-3 py-1.5">
                                <Badge variant="outline" className="text-[10px] rounded px-1 py-0">{entry.method}</Badge>
                              </td>
                              <td className="px-3 py-1.5 font-mono max-w-[180px] truncate" title={entry.path}>
                                {entry.path}
                              </td>
                              <td className="px-3 py-1.5 text-muted-foreground">{entry.service}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {result.wouldBlock.length > 100 && (
                      <p className="text-xs text-muted-foreground text-center py-2 border-t border-border">
                        Showing 100 of {result.wouldBlock.length} blocked entries
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="rounded-lg" onClick={handleRun} disabled={simulate.loading}>
                  <FlaskConical className="w-3 h-3 mr-1.5" />
                  Re-run simulation
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
