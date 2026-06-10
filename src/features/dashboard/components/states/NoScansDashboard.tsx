import type { Domain } from '@/features/domain/types/domain.types';
import { DomainSelector } from '@/features/dashboard/components/DomainSelector';
import { DomainEmptyState } from '@/features/dashboard/components/DomainEmptyState';

interface NoScansDashboardProps {
  domainsForSelector: Domain[];
  selectedDomain: Domain;
  onDomainChange: (domain: Domain) => void;
}

export function NoScansDashboard({
  domainsForSelector,
  selectedDomain,
  onDomainChange,
}: NoScansDashboardProps) {
  return (
    <div className='px-4 md:px-6 py-6 space-y-5 max-w-7xl mx-auto'>
      
      {/* Page header text removed (now in global layout header) */}

      <div className='flex w-full md:w-[369px]'>
        <DomainSelector
          domains={domainsForSelector}
          selected={selectedDomain}
          onChange={onDomainChange}
        />
      </div>

      <DomainEmptyState
        domainName={selectedDomain.domain}
        domainId={selectedDomain.id}
      />
    </div>
  );
}
