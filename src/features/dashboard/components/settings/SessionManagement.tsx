"use client";

import Image from "next/image";
import { LogOut, MoreHorizontal, Loader2 } from "lucide-react";
import { useSessions } from "../../hooks/useSessions";
import { toast } from "sonner";
import SettingsErrorState from "./SettingsErrorState";

function formatLastActive(dateStr: string) {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Unknown";
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
}

function getBrowserInfo(deviceName: string) {
  const lowerName = deviceName.toLowerCase();
  if (lowerName.includes("chrome")) {
    return { name: "Chrome", icon: "/images/google.jpg" };
  } else if (lowerName.includes("safari")) {
    return { name: "Safari", icon: "/images/apple-safari 1.jpg" };
  } else if (lowerName.includes("edge")) {
    return { name: "Edge", icon: "/images/google.jpg" };
  } else if (lowerName.includes("firefox")) {
    return { name: "Firefox", icon: "/images/google.jpg" };
  }
  return { name: "Browser", icon: "/images/google.jpg" };
}

const SessionManagement = () => {
  const { sessions, loading, error, refetch, revokeSession } = useSessions();

  const handleLogout = async (id: string) => {
    try {
      await revokeSession(id);
      toast.success("Session logged out successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log out session");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return <SettingsErrorState message={error} onRetry={() => void refetch()} />;
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-[8px] p-8 text-center text-gray-500 border border-gray-100">
        No active sessions found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const browserInfo = getBrowserInfo(session.deviceName);
        
        return (
          <div
            key={session.sessionId}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex flex-col gap-6">
              
              {/* Rows Container */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center">
                  <span className="w-[122px] shrink-0 text-base text-brand-dark">Device Name:</span>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-medium text-brand-dark">
                      {session.deviceName}
                    </span>
                    <div className="w-1.5 h-1.5 bg-brand-dark rounded-full shrink-0" />
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-brand-indigo-bg/50 border border-transparent">
                      <Image
                        src={browserInfo.icon}
                        alt={browserInfo.name}
                        width={16}
                        height={16}
                        className="rounded-full shrink-0 object-cover"
                      />
                      <span className="text-sm text-brand-indigo">{browserInfo.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-[122px] shrink-0 text-base text-brand-dark">Last Active:</span>
                  <span className="text-base text-brand-dark">{formatLastActive(session.lastUsedAt)}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-[122px] shrink-0 text-base text-brand-dark">IP Address:</span>
                  <span className="text-base text-brand-dark">{session.ipAddress || "Unknown"}</span>
                </div>

                <div className="flex items-center">
                  <span className="w-[122px] shrink-0 text-base text-brand-dark">Location:</span>
                  <span className="text-base text-brand-dark">Unknown Location</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-2 w-full flex items-center justify-between">
                {session.isCurrent ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-green-bright" />
                      <span className="text-base text-brand-dark">Current Session</span>
                    </div>
                    <span className="p-2 text-brand-icon-dark" aria-hidden="true">
                      <MoreHorizontal className="w-6 h-6" />
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLogout(session.sessionId)}
                    className="flex items-center justify-center gap-4 bg-primary hover:bg-primary-hover transition-colors text-white px-6 py-4 rounded-xl font-semibold text-base cursor-pointer"
                  >
                    Log out device
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
              
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionManagement;
