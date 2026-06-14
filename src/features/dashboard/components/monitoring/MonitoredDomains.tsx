'use client';

import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DomainMonitoringStatus = 'Active' | 'Warning' | 'Inactive';
export type DomainSslStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface MonitoredDomainCard {
  domainId: string;
  domainName: string;
  monitoringStatus: DomainMonitoringStatus;
  securityScore: number;
  sslStatus: DomainSslStatus;
}

// ── Placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER_DOMAINS: MonitoredDomainCard[] = [
  { domainId: '1', domainName: 'example.com', monitoringStatus: 'Active', securityScore: 92, sslStatus: 'Valid' },
  { domainId: '2', domainName: 'api.example.com', monitoringStatus: 'Active', securityScore: 88, sslStatus: 'Valid' },
  { domainId: '3', domainName: 'app.example.com', monitoringStatus: 'Warning', securityScore: 75, sslStatus: 'Expiring Soon' },
  { domainId: '4', domainName: 'staging.example.com', monitoringStatus: 'Active', securityScore: 90, sslStatus: 'Valid' },
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DomainMonitoringStatus }) {
  // Active → green bg #E8F7EF, text #1DAF61
  // Warning → red bg #FDEBEC, text #D00416
  // Inactive → gray
  const styles: Record<DomainMonitoringStatus, { bg: string; color: string }> = {
    Active:   { bg: '#E8F7EF', color: '#1DAF61' },
    Warning:  { bg: '#FDEBEC', color: '#D00416' },
    Inactive: { bg: '#F6F6F6', color: '#666666' },
  };
  const { bg, color } = styles[status];
  return (
    <span
      className="flex items-center justify-center"
      style={{
        padding: '4px 12px',
        background: bg,
        borderRadius: '8px',
        fontFamily: 'Geist, sans-serif',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '14px',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

// ── Single domain card ────────────────────────────────────────────────────────

function DomainCard({ card, onClick }: { card: MonitoredDomainCard; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${card.domainName}`}
      className="flex flex-col text-left cursor-pointer hover:shadow-lg shadow-md transition-shadow duration-200 flex-1 focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
      style={{
        background: '#fff',
        border: '1px solid #EDEDED',
        borderRadius: '8px',
        padding: '24px 16px',
        gap: '16px',
        minWidth: 0,
      }}
    >
      {/* Row 1: Globe icon (left) + Status badge (right) */}
      <div className="flex flex-row justify-between items-center w-full">
        <Globe size={20} strokeWidth={1.6} style={{ color: '#666666' }} />
        <StatusBadge status={card.monitoringStatus} />
      </div>

      {/* Row 2: Domain name */}
      <span
        className="w-full"
        style={{
          fontFamily: 'Geist, sans-serif',
          fontWeight: 600,
          fontSize: '16px',
          lineHeight: '16px',
          color: '#2B2B2B',
        }}
      >
        {card.domainName}
      </span>

      {/* Row 3: Score (left) + SSL status (right) — both gray */}
      <div className="flex flex-row justify-between items-center w-full">
        <span
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '14px',
            color: '#666666',
          }}
        >
          Score: {card.securityScore}
        </span>
        <span
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '14px',
            color: '#666666',
          }}
        >
          {card.sslStatus}
        </span>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface MonitoredDomainsProps {
  domains?: MonitoredDomainCard[];
  onAddDomain?: () => void;
}

export function MonitoredDomains({
  domains = PLACEHOLDER_DOMAINS,
  onAddDomain,
}: MonitoredDomainsProps) {
  const router = useRouter();

  return (
    // Outer white card — matches Figma Frame 2147232563
    <div
      className="flex flex-col w-full"
      style={{
        background: '#ffffffff',
        border: '1px solid #EDEDED',
        borderRadius: '12px',
        padding: '24px',
        gap: '32px',
      }}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <span
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '24px',
            color: '#2B2B2B',
          }}
        >
          Monitored Domains
        </span>

        {/* Add domain button — text only, no icon (PlusCircle is display:none in Figma) */}
        <button
          data-tour="add-domain"
          type="button"
          onClick={onAddDomain}
          className="flex items-center justify-center hover:opacity-90 transition-opacity"
          style={{
            padding: '16px 24px',
            background: '#072E28',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '22px',
            letterSpacing: '-0.5px',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add domain
        </button>
      </div>

      {/* Domain cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {domains.map((card) => (
          <DomainCard
            key={card.domainId}
            card={card}
            onClick={() => router.push(`/domain?domainId=${card.domainId}`)}
          />
        ))}
      </div>
    </div>
  );
}
