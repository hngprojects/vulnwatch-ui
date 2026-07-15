"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { repositoryService } from "@/features/repository-security/services/repository.service";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Guard against the effect running twice (React strict mode) firing two POSTs.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    if (!setupAction || !installationId) {
      toast.error("GitHub connection was cancelled or incomplete.");
      router.replace("/repositories");
      return;
    }

    repositoryService
      .connectGithub({ installationId: Number(installationId), setupAction })
      .then((res) => {
        toast.success(res.message || "GitHub connected successfully!");
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to connect GitHub.",
        );
      })
      .finally(() => {
        router.replace("/repositories");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h2 className="text-lg font-semibold text-slate-800">
        Completing GitHub connection...
      </h2>
      <p className="text-sm text-slate-500">Please wait while we redirect you.</p>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <GithubCallbackContent />
    </Suspense>
  );
}
