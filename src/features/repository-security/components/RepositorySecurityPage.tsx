"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RepositoryStatsBar } from "./RepositoryStatsBar";
import { RepositoryToolbar, type FilterStatus } from "./RepositoryToolbar";
import { RepositoryGrid } from "./RepositoryGrid";
import { repositoryService } from "../services/repository.service";
import type { Repository } from "../types/repository.types";

export function RepositorySecurityPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    repositoryService.getRepositories()
      .then(setRepositories)
      .catch((err) => {
        console.error("Failed to load repositories:", err);
        setRepositories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = () => {
    const url = process.env.GithubApp__InstallationUrl;
    if (!url) {
      toast.error("GitHub App is not configured yet.", {
        description: "Set GithubApp__InstallationUrl to enable connecting.",
      });
      return;
    }
    setDialogOpen(false);
    // GitHub redirects back to /repositories/github/callback with
    // installation_id & setup_action once the App is installed.
    window.location.href = url;
  };

  const filtered = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.fullName.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "monitored" && repo.isMonitored) ||
      (filter === "scanned" && !!repo.lastScanDate) ||
      (filter === "unscanned" && !repo.lastScanDate);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <RepositoryStatsBar repositories={repositories} />

      <RepositoryToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        onConnect={handleConnect}
      />

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-dark">
          Repositories{" "}
          <span className="font-normal text-brand-muted">({filtered.length})</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex h-[40vh] w-full flex-col items-center justify-center gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-neutral-500">Loading repositories...</p>
        </div>
      ) : (
        <RepositoryGrid
          repositories={filtered}
          searchQuery={search}
          onOpenConnectDialog={() => setDialogOpen(true)}
        />
      )}
    </div>
  );
}
