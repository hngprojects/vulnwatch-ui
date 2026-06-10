"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { DashboardHeader } from "@/features/dashboard/components/Header";
import { useAuthStore } from "@/store/auth.store";
import { domainService } from "@/features/domain/services/domain.service";
import { TourProvider } from "@/features/dashboard/components/tour/TourProvider";

function subscribeAuthStore(listener: () => void) {
  return useAuthStore.subscribe(listener);
}

function getAuthSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return useAuthStore.getState().token ?? localStorage.getItem("auth_token");
}

function getServerAuthSnapshot() {
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isRolesPermissionsPage =
    pathname === "/settings/roles-permissions" ||
    pathname === "/settings/roles-permission";
  const token = useSyncExternalStore(
    subscribeAuthStore,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );



  useEffect(() => {
    if (!token && !isRolesPermissionsPage) {
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
        if (match) {
          try {
            const decodedToken = decodeURIComponent(match[2]);
            useAuthStore.getState().login(decodedToken);
          } catch (e) {
            console.error("Failed to rehydrate token from cookie", e);
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      }
    }
  }, [token, isRolesPermissionsPage, router]);

  useEffect(() => {
    if (isRolesPermissionsPage) {
      return;
    }

    const pendingDomain = localStorage.getItem("pending_scan_domain");
    if (!pendingDomain) return;

    // Immediately remove from localStorage to prevent duplicate calls in React Strict Mode
    localStorage.removeItem("pending_scan_domain");

    let mounted = true;

    const registerPendingDomain = async () => {
      try {
        const response = await domainService.createDomain({ domain: pendingDomain });
        if (!mounted) return;
        router.push(`/domain/${response.id}/verify?token=${encodeURIComponent(response.verificationToken)}`);
      } catch (error) {
        console.error("Failed to create pending domain:", error);
        
        try {
          const list = await domainService.getDomains();
          const existing = list.data.find(
            (d) => d.domain.toLowerCase() === pendingDomain.toLowerCase()
          );

          if (existing && existing.status !== "Verified") {
            if (!mounted) return;
            if (existing.verificationToken) {
              router.push(`/domain/${existing.id}/verify?token=${encodeURIComponent(existing.verificationToken)}`);
            } else {
              console.error("Domain is pending but has no verification token:", existing);
              router.push("/dashboard");
            }
          }
        } catch (fetchError) {
          console.error("Failed to resolve existing domains:", fetchError);
        }
      }
    };

    registerPendingDomain();

    return () => {
      mounted = false;
    };
  }, [isRolesPermissionsPage, router, token]);

  if (!token && !isRolesPermissionsPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-dashboard-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-dashboard-bg overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TourProvider />
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
