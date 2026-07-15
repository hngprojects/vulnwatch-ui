export type VisibilityType = "Public" | "Private";

export type SeverityLevel = "Critical" | "High" | "Medium" | "Low";

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  visibility: VisibilityType;
  defaultBranch: string;
  lastScanDate: string | null;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  isMonitored: boolean;
}

export interface Vulnerability {
  id: string;
  packageName: string;
  currentVersion: string;
  fixedVersion: string | null;
  severity: SeverityLevel;
  cveId: string;
  cvssScore: number;
  description: string;
  referenceLinks: string[];
  plainExplanation: string;
  technicalExplanation: string;
  remediation: string[];
  discoveredDate: string;
  affectedFile: string;
}

export interface TrendDataPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// API contracts (/api/repositories)

export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: { code: string; message: string; details?: string } | null;
}

export interface Paginated<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  links: { self: string; next: string | null; prev: string | null };
}

export type RepositoryStatus = "PendingVerification" | "Active" | "Suspended";

export interface ApiRepositoryListItem {
  id: string;
  fullName: string;
  cloneUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  status: RepositoryStatus;
  createdAt: string;
  updatedAt: string;
  lastScannedAt: string | null;
}

export interface RepositorySettings {
  periodicScanEnabled: boolean;
  periodicScanFrequency: string;
  eventScanEnabled: boolean;
  triggers: string;
  alertChannels: string;
  nextScanDueAt?: string | null;
  lastScanAt?: string | null;
  version: string;
}

export interface ApiVulnerability {
  id: string;
  title: string;
  severity: SeverityLevel;
  package: string;
  cveId: string;
  status: string;
  detectedAt: string;
}

export interface ApiSeverityCount {
  severity: SeverityLevel;
  count: number;
}

export interface ApiRepositoryDetail {
  repositoryId: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  settings: RepositorySettings;
  latestScanStatus: string;
  lastScanAt: string | null;
  openBySeverity: ApiSeverityCount[];
  vulnerabilities: ApiVulnerability[];
  trend: TrendDataPoint[];
}

export interface GetRepositoriesParams {
  search?: string;
  status?: RepositoryStatus;
  sort_by?: string;
  order?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateRepositorySettingsPayload {
  periodicScanEnabled: boolean;
  periodicScanFrequency: string;
  eventScanEnabled: boolean;
  triggers: string;
  alertChannels: string;
  version: string;
}

export interface RepositoryDetailData {
  repository: Repository;
  vulnerabilities: Vulnerability[];
  trendData: TrendDataPoint[];
}

export interface ConnectGithubPayload {
  installationId: number;
  setupAction: string;
}
