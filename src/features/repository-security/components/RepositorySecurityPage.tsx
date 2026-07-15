"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RepositoryStatsBar } from "./RepositoryStatsBar";
import { RepositoryToolbar, type FilterStatus } from "./RepositoryToolbar";
import { RepositoryGrid } from "./RepositoryGrid";
import { repositoryService } from "../services/repository.service";
import type { Repository } from "../types/repository.types";

export function RepositorySecurityPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    repositoryService.getRepositories()
      .then(setRepositories)
      .catch((err) => {
        console.error("Failed to load repositories:", err);
        setRepositories([]);
      });
  }, []);

  const handleConnect = () => {
    const url = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
    if (!url) {
      toast.error("GitHub App is not configured yet.", {
        description: "Set NEXT_PUBLIC_GITHUB_APP_INSTALL_URL to enable connecting.",
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

      <RepositoryGrid
        repositories={filtered}
        searchQuery={search}
        onOpenConnectDialog={() => setDialogOpen(true)}
      />
    </div>
  );
}
