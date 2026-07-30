import { privateApi } from "@/lib/axios";
import axios from "axios";

const SCAN_REPORT_CACHE_PREFIX = "scan-report-cache:";
const SCAN_REPORT_CACHE_SPINNER_DELAY_MS = 180;
const completedScanReportCache = new Map<string, ApiResponse<ScanReport>>();
const inFlightScanReportRequests = new Map<string, Promise<ApiResponse<ScanReport>>>();
// Incremented on every clearScanReportCache() call so in-flight requests
// that resolve after a logout cannot re-populate the cache.
let scanReportCacheGeneration = 0;

// Maps our internal UI enum values to what the API expects
const COVERAGE_MAP: Record<string, "Quick" | "Full"> = {
  QUICK_SCAN: "Quick",
  FULL_SCAN: "Full",
};

export interface CreateScanPayload {
  domainId: string;
  scanType: "QUICK_SCAN" | "FULL_SCAN";
}

export type ScanTargetType = "Domain" | "Repository";

/** Unified scan payload: scans a domain or repository by id. */
export interface CreateTargetScanPayload {
  target: string;
  targetType: ScanTargetType;
  coverage?: "Quick" | "Full";
  surfaceTypes?: string;
}

export interface ScanResponse {
  scanId: string;
  status: "Queued" | string;
  message: string;
  initiatedAt?: string;
}

export interface ScanSubScore {
  status: string; // e.g. "Pass"
  score: number;
  detail?: string;
  title?: string;
  explanation?: string;
}

export interface FindingDto {
  id: string;
  surface: string;
  severity: string;
  title: string;
  cveId: string | null;
  explanation: string;
  remediationSteps: string[];
  technicalDetail: unknown;
  status: string;
}

export interface ScanSummaryDto {
  criticalIssues: (string | FindingDto)[] | null;
  highSeverityIssues: (string | FindingDto)[] | null;
  mediumSeverityIssues?: (string | FindingDto)[] | null;
  lowSeverityIssues?: (string | FindingDto)[] | null;
  goodNews: string | null;
  topRecommendation?: string | null;
  headline?: string | null;
}

export interface FindingGroupsDto {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passCount: number;
}

export interface ScanReport {
  scanId: string;
  domainId: string;
  domainName: string;
  domainStatus?: string;
  requestedBy?: string;
  securityScore: number;
  status: string; // e.g. "Completed"
  coverage?: string;
  riskLevel?: string | null;
  initiatedAt?: string;
  completedAt?: string;
  summary?: ScanSummaryDto | null;
  findingGroups?: FindingGroupsDto | null;
  subScores: {
    exposure: ScanSubScore;
    ssl: ScanSubScore;
    dns: ScanSubScore;
  };
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface SubScoreItem {
  score: number;
  status: string | null;
  detail: string | null;
}

export interface SubScoresDto {
  exposure: SubScoreItem | null;
  ssl: SubScoreItem | null;
  dns: SubScoreItem | null;
}

export interface ScanReportDto {
  scanId: string;
  domainId: string;
  domainName: string | null;
  domainStatus: string;
  status: "Queued" | "Running" | "Completed" | "Failed" | string;
  coverage: "Quick" | "Full" | string;
  securityScore: number | null;
  riskLevel: string | null;
  completedAt: string | null;
  summary: ScanSummaryDto | null;
  findingGroups: FindingGroupsDto | null;
  subScores: SubScoresDto | null;
}

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const apiMessage = error.response?.data?.error?.message;
    if (apiMessage) {
      return apiMessage;
    }

    if (error.response?.status) {
      return `Request failed with status code ${error.response.status}`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Request failed";
}

function normalizeSubScore(item: SubScoreItem | null | undefined): ScanSubScore {
  return {
    score: item?.score ?? 0,
    status: item?.status ?? "Unknown",
    detail: item?.detail ?? undefined,
  };
}

function normalizeScanReport(dto: ScanReportDto): ScanReport {
  return {
    scanId: dto.scanId,
    domainId: dto.domainId,
    domainName: dto.domainName ?? "",
    domainStatus: dto.domainStatus,
    securityScore: dto.securityScore ?? 0,
    status: dto.status,
    coverage: dto.coverage,
    riskLevel: dto.riskLevel,
    completedAt: dto.completedAt ?? undefined,
    summary: dto.summary ?? null,
    findingGroups: dto.findingGroups ?? null,
    subScores: {
      exposure: normalizeSubScore(dto.subScores?.exposure),
      ssl: normalizeSubScore(dto.subScores?.ssl),
      dns: normalizeSubScore(dto.subScores?.dns),
    },
  };
}

function getCompletedScanReportCacheKey(scanId: string) {
  return `${SCAN_REPORT_CACHE_PREFIX}${scanId}`;
}

function readCompletedScanReportFromSession(scanId: string): ApiResponse<ScanReport> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getCompletedScanReportCacheKey(scanId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as ApiResponse<ScanReport>;
    if (parsed.isSuccess && parsed.value?.status === "Completed") {
      return parsed;
    }
  } catch {
    // Ignore malformed session cache and fall through to a fresh request.
  }

  return null;
}

function writeCompletedScanReportToSession(
  scanId: string,
  response: ApiResponse<ScanReport>,
) {
  if (typeof window === "undefined" || !response.isSuccess || response.value?.status !== "Completed") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      getCompletedScanReportCacheKey(scanId),
      JSON.stringify(response),
    );
  } catch {
    // Ignore storage quota/unavailability and keep the in-memory cache only.
  }
}

function readCompletedScanReportFromCache(scanId: string): ApiResponse<ScanReport> | null {
  const memoryCache = completedScanReportCache.get(scanId);
  if (memoryCache?.isSuccess && memoryCache.value?.status === "Completed") {
    return memoryCache;
  }

  const sessionCache = readCompletedScanReportFromSession(scanId);
  if (sessionCache) {
    completedScanReportCache.set(scanId, sessionCache);
    return sessionCache;
  }

  return null;
}

function cacheCompletedScanReport(scanId: string, response: ApiResponse<ScanReport>) {
  if (!response.isSuccess || response.value?.status !== "Completed") {
    return;
  }

  completedScanReportCache.set(scanId, response);
  writeCompletedScanReportToSession(scanId, response);
}

/**
 * Clears all cached scan reports from memory and sessionStorage.
 * Must be called on user logout to prevent leaking scan data between sessions.
 */
export function clearScanReportCache() {
  // Increment first so any in-flight promise that checks the generation
  // after this point will see a mismatch and skip writing to the cache.
  scanReportCacheGeneration++;
  completedScanReportCache.clear();
  inFlightScanReportRequests.clear();

  if (typeof window !== "undefined") {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(SCAN_REPORT_CACHE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to extract only the pure domain name from any input URL/string
export function cleanDomain(input: string): string | null {
  if (!input) return null;
  let cleaned = input.trim().toLowerCase();

  try {
    let urlToParse = cleaned;
    if (!/^(https?:)?\/\//i.test(cleaned)) {
      urlToParse = `http://${cleaned}`;
    }
    const parsed = new URL(urlToParse);
    let hostname = parsed.hostname;

    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }
    return hostname || null;
  } catch {
    // Fall back to manual normalization if parsing fails
    cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");
    // Explicitly remove query strings and hashes
    cleaned = cleaned.split("#")[0].split("?")[0];
    cleaned = cleaned.split("/")[0];
    cleaned = cleaned.split(":")[0];
    return cleaned || null;
  }
}

export interface ScanHistoryItem {
  scanId: string;
  domainId: string;
  domainName: string;
  status: string;
  riskLevel: string | null;
  coverage: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface ScanHistoryResponse {
  data: ScanHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ScanHistoryParams {
  status?: "Queued" | "Running" | "Completed" | "Failed";
  coverage?: "Quick" | "Full";
  sort_by?: "createdAt" | "startedAt" | "finishedAt" | "coverage" | "status";
  order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export const scanService = {
  async createScan(
    payload: CreateScanPayload,
  ): Promise<ApiResponse<ScanResponse>> {
    if (!payload.domainId) {
      throw new Error("Invalid domain ID");
    }

    const response = await privateApi.post<ApiResponse<ScanResponse>>(
      "/api/scans",
      {
        target: payload.domainId,
        targetType: "Domain",
        coverage: COVERAGE_MAP[payload.scanType],
        surfaceTypes: "Dns, Ssl, Http",
      },
      {
        headers: {
          // Idempotency-Key prevents duplicate scans if the request is retried
          "Idempotency-Key": crypto.randomUUID(),
        },
      },
    );
    return response.data;
  },

  async createTargetScan(
    payload: CreateTargetScanPayload,
  ): Promise<ApiResponse<ScanResponse>> {
    const response = await privateApi.post<ApiResponse<ScanResponse>>(
      "/api/scans",
      {
        target: payload.target,
        targetType: payload.targetType,
        coverage: payload.coverage ?? "Quick",
        surfaceTypes: payload.surfaceTypes ?? "None",
      },
      {
        headers: {
          // Idempotency-Key prevents duplicate scans if the request is retried
          "Idempotency-Key": crypto.randomUUID(),
        },
      },
    );
    return response.data;
  },

  async getScanReport(scanId: string): Promise<ApiResponse<ScanReport>> {
    const cachedReport = readCompletedScanReportFromCache(scanId);
    if (cachedReport) {
      if (typeof window !== "undefined") {
        await delay(SCAN_REPORT_CACHE_SPINNER_DELAY_MS);
      }
      return cachedReport;
    }

    const inFlightRequest = inFlightScanReportRequests.get(scanId);
    if (inFlightRequest) {
      return inFlightRequest;
    }

    // Capture the generation synchronously before any await so that if
    // clearScanReportCache() is called while this request is in-flight,
    // the resolved value is discarded instead of re-populating the cache.
    const requestGeneration = scanReportCacheGeneration;

    const request = (async () => {
      try {
        const response = await privateApi.get<ApiResponse<ScanReportDto>>(
          `/api/Scans/${scanId}/report`,
        );

        if (!response.data.isSuccess || !response.data.value) {
          return {
            isSuccess: false,
            value: null,
            error: response.data.error ?? {
              code: "SCAN_REPORT_ERROR",
              message: "Unable to load scan report.",
            },
          };
        }

        const normalizedResponse: ApiResponse<ScanReport> = {
          isSuccess: true,
          value: normalizeScanReport(response.data.value),
          error: null,
        };

        // Only write to cache if no logout happened while we were awaiting.
        if (scanReportCacheGeneration === requestGeneration) {
          cacheCompletedScanReport(scanId, normalizedResponse);
        }
        return normalizedResponse;
      } catch (error) {
        return {
          isSuccess: false,
          value: null,
          error: {
            code: "SCAN_REPORT_ERROR",
            message: getApiErrorMessage(error),
          },
        };
      } finally {
        // Only clean up the in-flight entry if it still belongs to this generation.
        if (scanReportCacheGeneration === requestGeneration) {
          inFlightScanReportRequests.delete(scanId);
        }
      }
    })();

    inFlightScanReportRequests.set(scanId, request);
    return request;
  },

  async getScanHistory(domainId: string, params?: ScanHistoryParams): Promise<ApiResponse<ScanHistoryResponse>> {
    const response = await privateApi.get<ApiResponse<ScanHistoryResponse>>(
      `/api/Scans/${domainId}/history`,
      { params }
    );
    return response.data;
  },
};

