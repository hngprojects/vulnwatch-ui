import { privateApi } from "@/lib/axios";

export interface ProfileValue {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  emailConfirmed: boolean;
  hasGoogleLinked: boolean;
  notificationPreferences: {
    emailAlerts: boolean;
    slackAlerts: boolean;
    pushNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  value: T | null;
  error: { code: string; message: string } | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  slackAlerts: boolean;
  pushNotifications: boolean;
}

function unwrap<T>(res: { data: ApiResponse<T>; status: number }): T {
  if (!res.data.isSuccess || res.data.value === null || res.data.value === undefined) {
    throw new Error(res.data.error?.message ?? `Request failed (${res.status})`);
  }
  return res.data.value;
}

export const profileService = {
  async getProfile(): Promise<ProfileValue> {
    const res = await privateApi.get<ApiResponse<ProfileValue>>("/api/Profile");
    return unwrap(res);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileValue> {
    const res = await privateApi.put<ApiResponse<ProfileValue>>("/api/Profile", payload);
    return unwrap(res);
  },

  async updateNotificationPreferences(payload: NotificationPreferences): Promise<NotificationPreferences> {
    const res = await privateApi.put<ApiResponse<NotificationPreferences>>("/api/profile/notifications", payload);
    return unwrap(res);
  },

  async deleteProfile(): Promise<void> {
    await privateApi.delete("/api/Profile");
  },
};
