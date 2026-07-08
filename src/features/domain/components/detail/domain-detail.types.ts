// Static placeholder types until API data is wired

export type AlertSeverity = "Info" | "Low" | "Medium" | "High" | "Critical";
export type AlertType = "SslExpiry" | "SecurityFinding" | "DnsChange" | string;

export interface SecurityAlert {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  subject: string;
  createdAt: string;
}
export type RiskLevel = "safe" | "moderate" | "critical" | "unknown";

export interface DomainDetailData {
  domainName: string;
  domainStatus: "Verified" | "Pending" | "Failed" | "Revoked";
  monitoringActive: boolean;
  securityScore: number;
  riskLevel: RiskLevel;
  vulnerabilityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  ssl: {
    isValid: boolean;
    expiresInDays: number | null;
  };
  nextScanIn: string | null;
  lastMonitoredAt: string | null;
  recentActivity: ActivityEvent[];
  monitoringSettings: MonitoringSettings;
  recentAlerts: SecurityAlert[];
  tokenExpiringSoon: boolean;
}

export interface ActivityEvent {
  id: string | number;
  iconType: ActivityIconType;
  title: string;
  detail: string;
  time: string;
  colorVariant: "green" | "blue" | "purple" | "amber" | "slate" | "red";
}

export type ActivityIconType =
  | "scan"
  | "ssl"
  | "settings"
  | "refresh"
  | "activity"
  | "domain";

export interface MonitoringSettings {
  scanFrequency: ScanFrequency;
  sslAlertThresholds: string[];
  emailAlerts: boolean;
  slackAlerts: boolean;
}

export type ScanFrequency = "Hourly" | "Daily" | "Weekly";
export type ScanType = "quick" | "deep";
