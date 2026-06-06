import { privateApi } from "@/lib/axios";

interface ApiResponse<T> {
  isSuccess: boolean;
  value: T;
  error: { code: string; message: string } | null;
}

function unwrap<T>(res: { data: unknown; status: number }): T {
  const data = res.data;
  if (data !== null && typeof data === "object" && "isSuccess" in data) {
    const apiResponse = data as Record<string, unknown>;
    if (!apiResponse.isSuccess || apiResponse.value === undefined) {
      const errorObj = apiResponse.error as { message?: string } | undefined;
      throw new Error(errorObj?.message ?? `Request failed (${res.status})`);
    }
    return apiResponse.value as T;
  }
  return data as T;
}

export interface SlackStatus {
  isConnected: boolean;
  workspaceName?: string;
}

export const integrationsService = {
  async getSlackStatus(): Promise<SlackStatus> {
    try {
      const res = await privateApi.get<unknown>("/api/integrations/slack/status");
      const value = unwrap<unknown>(res);
      // Handle case where value is just a boolean or an object
      if (typeof value === "boolean") {
        return { isConnected: value };
      }
      if (value !== null && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        if ("isConnected" in obj) {
          return {
            isConnected: Boolean(obj.isConnected),
            workspaceName: (obj.teamName as string | undefined) || (obj.workspaceName as string | undefined),
          };
        }
      }
      return { isConnected: !!value };
    } catch {
      // If it's a 404 or something, we can assume disconnected
      return { isConnected: false };
    }
  },

  async getSlackAuthorizeUrl(): Promise<{ authorizationUrl: string }> {
    const res = await privateApi.get<ApiResponse<{ authorizationUrl: string }>>("/api/integrations/slack/authorize");
    return unwrap(res);
  },

  async disconnectSlack(): Promise<{ message: string }> {
    const res = await privateApi.delete<ApiResponse<{ message: string }>>("/api/integrations/slack");
    return unwrap(res);
  },
};
