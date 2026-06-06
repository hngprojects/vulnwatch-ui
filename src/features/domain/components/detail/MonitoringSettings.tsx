"use client";

import { useState, useEffect } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { integrationsService, SlackStatus } from "@/features/dashboard/services/integrations.service";
import type { MonitoringSettings as MonitoringSettingsType, ScanFrequency } from "./domain-detail.types";

const SSL_THRESHOLDS = ["30 Days", "14 Days", "7 Days", "3 Days"] as const;
const SCAN_FREQUENCIES: ScanFrequency[] = ["Hourly", "Daily", "Weekly"];

interface MonitoringSettingsProps {
  initialSettings: MonitoringSettingsType;
  onSave: (settings: MonitoringSettingsType) => void;
}

export function MonitoringSettings({ initialSettings, onSave }: MonitoringSettingsProps) {
  const [settings, setSettings] = useState<MonitoringSettingsType>(initialSettings);
  const [customDays, setCustomDays] = useState("");
  
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [showSlackDialog, setShowSlackDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    integrationsService.getSlackStatus().then(setSlackStatus).catch(console.error);
  }, []);

  const handleAddCustom = () => {
    const parsed = parseInt(customDays, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const newThreshold = `${parsed} Days`;
      if (!settings.sslAlertThresholds.includes(newThreshold)) {
        setSettings((prev) => ({
          ...prev,
          sslAlertThresholds: [...prev.sslAlertThresholds, newThreshold],
        }));
      }
      setCustomDays("");
    }
  };

  const toggleThreshold = (t: string) => {
    setSettings((prev) => ({
      ...prev,
      sslAlertThresholds: prev.sslAlertThresholds.includes(t)
        ? prev.sslAlertThresholds.filter((x) => x !== t)
        : [...prev.sslAlertThresholds, t],
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleConnectSlack = async () => {
    setIsConnecting(true);
    try {
      const { authorizationUrl } = await integrationsService.getSlackAuthorizeUrl();
      if (authorizationUrl) {
        window.open(authorizationUrl, "_blank");
        setShowSlackDialog(false);
        // Let the user know they can check the box after they finish
        toast.info("Please check the Slack Alerts box again once you've authorized Slack.");
      }
    } catch {
      toast.error("Failed to initiate Slack connection");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSlackAlertChange = async (v: boolean | "indeterminate") => {
    const checked = v === true;
    if (!checked) {
      setSettings((prev) => ({ ...prev, slackAlerts: false }));
      return;
    }

    // If we already know they are connected, allow it instantly
    if (slackStatus?.isConnected) {
      setSettings((prev) => ({ ...prev, slackAlerts: true }));
      return;
    }

    // Otherwise, hit the endpoint to see if they recently connected
    try {
      const status = await integrationsService.getSlackStatus();
      setSlackStatus(status);

      if (!status.isConnected) {
        setShowSlackDialog(true);
      } else {
        setSettings((prev) => ({ ...prev, slackAlerts: true }));
      }
    } catch {
      setShowSlackDialog(true);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-full">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900 font-geist">
            Automated Monitoring Settings
          </h3>
        </div>

        <div className="space-y-6">
          {/* Scan Frequency */}
          <div className="space-y-2">
            <Label htmlFor="scan-frequency" className="text-sm font-semibold text-slate-700">Scan Frequency</Label>
            <select
              id="scan-frequency"
              value={settings.scanFrequency}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  scanFrequency: e.target.value as ScanFrequency,
                }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              {SCAN_FREQUENCIES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* SSL Alert Thresholds */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">SSL Alert Thresholds</Label>
            <p className="text-xs text-slate-400">Alert me when SSL expires within:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SSL_THRESHOLDS.map((t) => {
                const active = settings.sslAlertThresholds.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleThreshold(t)}
                    className={[
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-600 border-gray-200 hover:border-slate-400",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}

              {/* Custom added thresholds */}
              {settings.sslAlertThresholds
                .filter((t) => !(SSL_THRESHOLDS as readonly string[]).includes(t))
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleThreshold(t)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all bg-primary text-white border-primary"
                  >
                    {t}
                  </button>
                ))}

              {/* Custom Input Pill */}
              <div className="flex items-center gap-1 ml-1">
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  placeholder="Days"
                  className="w-16 px-2 py-1.5 text-xs text-center rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customDays}
                  className="w-7 h-7 flex items-center justify-center bg-gray-100 text-slate-700 hover:bg-gray-200 rounded-full text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Notification Channels</Label>
            <div className="space-y-3 mt-1">
              {[
                {
                  id: "email-alerts",
                  key: "emailAlerts" as const,
                  label: "Email Alerts",
                  sub: "Receive scan results to your inbox",
                },
                {
                  id: "slack-alerts",
                  key: "slackAlerts" as const,
                  label: "Slack Alerts",
                  sub: "Send notifications to your Slack workspace",
                },
              ].map(({ id, key, label, sub }) => (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 bg-brand-bg border border-gray-200 rounded-lg"
                >
                  <Checkbox
                    id={id}
                    checked={settings[key]}
                    onCheckedChange={(v) => {
                      if (key === "slackAlerts") {
                        void handleSlackAlertChange(v);
                      } else {
                        setSettings((prev) => ({ ...prev, [key]: !!v }));
                      }
                    }}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div>
                    <Label
                      htmlFor={id}
                      className="text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      {label}
                    </Label>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white mt-2 font-semibold"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </div>
      </div>

      <Dialog open={showSlackDialog} onOpenChange={setShowSlackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slack Not Connected</DialogTitle>
            <DialogDescription>
              You need to connect your Slack workspace before you can enable Slack alerts. Would you like to connect it now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowSlackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectSlack} disabled={isConnecting}>
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Connect Slack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
