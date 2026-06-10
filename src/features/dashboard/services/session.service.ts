import { privateApi } from "@/lib/axios";

export interface SessionData {
  sessionId: string;
  deviceName: string;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: { code: string; message: string } | null;
}

function unwrap<T>(res: { data: ApiResponse<T>; status: number }): T {
  if (!res.data.isSuccess || res.data.value === null || res.data.value === undefined) {
    throw new Error(res.data.error?.message ?? `Request failed (${res.status})`);
  }
  return res.data.value;
}

export const sessionService = {
  async getSessions(): Promise<SessionData[]> {
    const res = await privateApi.get<ApiResponse<SessionData[]>>("/api/sessions");
    return unwrap(res);
  },

  async revokeSession(sessionId: string): Promise<void> {
    await privateApi.delete(`/api/sessions/${encodeURIComponent(sessionId)}`);
  },

  async revokeAllOtherSessions(): Promise<void> {
    await privateApi.delete("/api/sessions");
  },
};
