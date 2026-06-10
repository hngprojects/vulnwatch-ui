"use client";

import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import SecurityPrivacySettings from "./SecurityPrivacySettings";
import SessionManagement from "./SessionManagement";
import IntegrationsSettings from "./IntegrationsSettings";
import { Tabs, type TabOption } from "@/components/ui/tabs";

type Tab = "general" | "security" | "session" | "integrations";

const TABS: TabOption<Tab>[] = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "session", label: "Session Management" },
  { id: "integrations", label: "Integrations" },
];

type SettingsProps = {
  initialTab?: Tab;
};

const Settings = ({ initialTab = "general" }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
        ariaLabel="Settings sections"
        layoutId="settingsTabsIndicator"
      />

      <div className="mt-8">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "security" && <SecurityPrivacySettings />}
        {activeTab === "integrations" && <IntegrationsSettings />}
        {activeTab === "session" && <SessionManagement />}
      </div>
    </div>
  );
};

export default Settings;
