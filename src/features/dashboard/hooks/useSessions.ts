"use client";

import { useCallback, useEffect, useState } from "react";
import { sessionService, type SessionData } from "../services/session.service";

type UseSessionsResult = {
  sessions: SessionData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
};

export const useSessions = (): UseSessionsResult => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    await sessionService.revokeSession(sessionId);
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return {
    sessions,
    loading,
    error,
    refetch: load,
    revokeSession,
  };
};
