export interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface JoinWaitlistRequest {
  email: string;
  companyName?: string;
  comments?: string;
  referralCode?: string;
}

export interface WaitlistResponse {
  email: string;
  position: number;
  status: string;
  createdAt: string;
  emailConfirmed: boolean;
}

export interface WaitlistStatusResponse {
  email: string;
  position: number;
  totalOnWaitlist: number;
  status: string;
  emailConfirmed: boolean;
  joinedAt: string;
}

export interface RequestWaitlistCancellationRequest {
  email: string;
}

export interface CancelWaitlistRequest {
  email: string;
  token?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      try {
        const errorData = await res.json();
        return {
          isSuccess: false,
          value: null,
          error: {
            code: errorData.error?.code || res.status.toString(),
            message: errorData.error?.message || `Request failed with status ${res.status}`,
          },
        };
      } catch {
        return {
          isSuccess: false,
          value: null,
          error: {
            code: res.status.toString(),
            message: `Request failed with status ${res.status}`,
          },
        };
      }
    }

    const data = await res.json();
    return data as ApiResponse<T>;
  } catch (error: unknown) {
    clearTimeout(id);
    const err = error as Error;
    if (err.name === "AbortError") {
      return {
        isSuccess: false,
        value: null,
        error: { code: "TIMEOUT", message: "The request timed out. Please try again." },
      };
    }
    return {
      isSuccess: false,
      value: null,
      error: { code: "NETWORK_ERROR", message: err.message || "A network error occurred." },
    };
  }
}

export const waitlistService = {
  async join(data: JoinWaitlistRequest): Promise<ApiResponse<WaitlistResponse>> {
    return fetchWithTimeout<WaitlistResponse>(`${API_BASE}/api/waitlist/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async verify(email: string, token: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithTimeout<{ message: string }>(
      `${API_BASE}/api/waitlist/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  },

  async status(email: string): Promise<ApiResponse<WaitlistStatusResponse>> {
    return fetchWithTimeout<WaitlistStatusResponse>(
      `${API_BASE}/api/waitlist/status?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  },

  async cancel(data: CancelWaitlistRequest): Promise<ApiResponse<{ message: string }>> {
    return fetchWithTimeout<{ message: string }>(`${API_BASE}/api/waitlist/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async requestCancel(data: RequestWaitlistCancellationRequest): Promise<ApiResponse<{ message: string }>> {
    return fetchWithTimeout<{ message: string }>(`${API_BASE}/api/waitlist/cancel/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
};
