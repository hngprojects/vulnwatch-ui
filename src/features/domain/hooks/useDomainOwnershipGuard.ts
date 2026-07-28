import { useState, useEffect } from "react";
import { domainService } from "../services/domain.service";
import type { Domain } from "../types/domain.types";

export function extractApiError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (e.response && typeof e.response === "object") {
      const resp = e.response as Record<string, unknown>;
      if (resp.data && typeof resp.data === "object") {
        const data = resp.data as Record<string, unknown>;
        if (data.error && typeof data.error === "object") {
          const apiErr = data.error as { message?: string };
          if (apiErr.message) return apiErr.message;
        }
      }
    }
  }
  if (err instanceof Error) return err.message;
  return "Verification failed. Please try again.";
}

export function useDomainOwnershipGuard(domainId: string) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkOwnershipAndLoad() {
      if (!domainId) {
        if (active) {
          setLoading(false);
          setError("Domain ID is missing.");
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const myDomains = await domainService.getDomains();
        const ownsDomain = myDomains.data.some((d) => d.id === domainId);

        if (!ownsDomain) {
          if (active) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        const dom = await domainService.getDomain(domainId);
        
        if (active) {
          setAuthorized(true);
          setDomain(dom);
        }
      } catch (err) {
        if (active) {
          setError(extractApiError(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkOwnershipAndLoad();

    return () => {
      active = false;
    };
  }, [domainId]);

  return { domain, loading, authorized, error };
}
