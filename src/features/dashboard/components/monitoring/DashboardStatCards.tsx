'use client';

import { Shield, TriangleAlert, Lock, Globe, TrendingUp, TrendingDown, Minus, CheckCircle, Clock } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  footer: React.ReactNode;
}

function StatCard({ label, value, icon, footer }: StatCardProps) {
  return (
    <div
      className="flex flex-row items-start gap-6 flex-1"
      style={{
        background: '#FFFFFF',
        border: '1px solid #EDEDED',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      {/* Left: label + value + footer */}
      <div className="flex flex-col gap-4 flex-1">
        <span
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '16px',
            color: '#666666',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Geist, sans-serif',
            fontWeight: 500,
            fontSize: '32px',
            lineHeight: '32px',
            letterSpacing: '0.02em',
            color: '#2B2B2B',
          }}
        >
          {value}
        </span>
        <div>{footer}</div>
      </div>

      {/* Right: icon badge */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: '32px',
          height: '32px',
          background: '#F6F6F6',
          borderRadius: '4px',
          padding: '8px',
        }}
      >
        {icon}
      </div>
    </div>
  );
}

// ── Trend badge (dynamic up/down/neutral) ────────────────────────────────────

function ScoreTrendIndicator({ text, direction }: { text: string; direction: 'up' | 'down' | 'neutral' }) {
  const isUp = direction === 'up';
  const isDown = direction === 'down';
  const color = isUp ? '#1DAF61' : isDown ? '#D00416' : '#666666';
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className="flex flex-row items-center gap-2">
      <Icon size={16} style={{ color }} />
      <span
        style={{
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '14px',
          letterSpacing: '0.02em',
          color,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ── Severity pills ─────────────────────────────────────────────────────────────

function SeverityPills({ critical, high }: { critical: number; high: number }) {
  return (
    <div className="flex flex-row items-center gap-3">
      <span
        className="flex items-center justify-center"
        style={{
          padding: '4px 12px',
          background: '#D00416',
          borderRadius: '8px',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '12px',
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
        }}
      >
        {critical} Critical
      </span>
      <span
        className="flex items-center justify-center"
        style={{
          padding: '4px 12px',
          background: '#DD6414',
          borderRadius: '8px',
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
          fontSize: '12px',
          lineHeight: '12px',
          letterSpacing: '0.02em',
          color: '#FFFFFF',
          whiteSpace: 'nowrap',
        }}
      >
        {high} High
      </span>
    </div>
  );
}

// ── SSL expiry label ──────────────────────────────────────────────────────────

function SslExpiry({ count }: { count: number }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <Clock size={16} style={{ color: '#DD6414' }} />
      <span
        style={{
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '14px',
          letterSpacing: '0.02em',
          color: '#DD6414',
        }}
      >
        {count} expiry soon
      </span>
    </div>
  );
}

// ── All verified label ────────────────────────────────────────────────────────

function AllVerified() {
  return (
    <div className="flex flex-row items-center gap-2">
      <CheckCircle size={16} style={{ color: '#1DAF61' }} />
      <span
        style={{
          fontFamily: 'Geist, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '14px',
          letterSpacing: '0.02em',
          color: '#1DAF61',
        }}
      >
        All verified
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DashboardStatCardsProps {
  securityScore?: number;
  scoreTrend?: string;
  scoreTrendDirection?: 'up' | 'down' | 'neutral';
  totalIssues?: number;
  criticalCount?: number;
  highCount?: number;
  sslCount?: number;
  sslExpiringSoon?: number;
  monitoredDomains?: number;
  allVerified?: boolean;
}

export function DashboardStatCards({
  securityScore = 78,
  scoreTrend = '+5 from last week',
  scoreTrendDirection = 'up',
  totalIssues = 78,
  criticalCount = 2,
  highCount = 5,
  sslCount = 4,
  sslExpiringSoon = 1,
  monitoredDomains = 4,
  allVerified = true,
}: DashboardStatCardsProps) {
  return (
    <div id="tour-stat-cards" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-stretch gap-4 md:gap-6 w-full">
      {/* Security Score */}
      <StatCard
        label="Security Score"
        value={securityScore}
        icon={<Shield size={15} style={{ color: '#072E28' }} />}
        footer={<ScoreTrendIndicator text={scoreTrend} direction={scoreTrendDirection} />}
      />

      {/* Total Issue */}
      <StatCard
        label="Total Issue"
        value={totalIssues}
        icon={<TriangleAlert size={18} style={{ color: '#072E28' }} />}
        footer={<SeverityPills critical={criticalCount} high={highCount} />}
      />

      {/* SSL Certificate */}
      <StatCard
        label="SSL Certificate"
        value={sslCount}
        icon={<Lock size={15} style={{ color: '#072E28' }} />}
        footer={<SslExpiry count={sslExpiringSoon} />}
      />

      {/* Monitored Domain */}
      <StatCard
        label="Monitored Domain"
        value={monitoredDomains}
        icon={<Globe size={16} style={{ color: '#666666' }} />}
        footer={allVerified ? <AllVerified /> : null}
      />
    </div>
  );
}
