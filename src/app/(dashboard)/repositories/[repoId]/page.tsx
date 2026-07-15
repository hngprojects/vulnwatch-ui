"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RepositoryDetail } from "@/features/repository-security/components/RepositoryDetail";
import { repositoryService } from "@/features/repository-security/services/repository.service";
import type {
  Repository,
  Vulnerability,
  TrendDataPoint,
} from "@/features/repository-security/types/repository.types";

export default function RepositoryDetailPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const router = useRouter();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!repoId) return;

    let active = true;

    const loadData = async () => {
      try {
        const detail = await repositoryService.getRepositoryDetail(repoId);
        if (active) {
          setRepository(detail.repository);
          setVulnerabilities(detail.vulnerabilities);
          setTrendData(detail.trendData);
        }
      } catch (err) {
        console.error("Failed to load repository details:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [repoId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-brand-dark">Repository not found</p>
        <button
          className="text-sm text-brand-info underline"
          onClick={() => router.push("/repositories")}
        >
          Back to Repositories
        </button>
      </div>
    );
  }

  return (
    <RepositoryDetail
      repository={repository}
      vulnerabilities={vulnerabilities}
      trendData={trendData}
    />
  );
}
