'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import DashboardSidebarIcon from '@/lib/icons/dashboard-sidebar-icon';
import DomainSidebarIcon from '@/lib/icons/domain-sidebar-icon';
import ReportSidebarIcon from '@/lib/icons/report-sidebar-icon';
import SettingsIcon from '@/lib/icons/settings-icon';

type NavItemType = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItemType[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardSidebarIcon />,
  },
  {
    label: 'Domain',
    href: '/domain',
    icon: <DomainSidebarIcon />,
  },
  { label: 'Report', href: '/report', icon: <ReportSidebarIcon /> },
  {
    label: 'Repositories',
    href: '/repositories',
    icon: <GitFork className="h-[22px] w-[22px]" strokeWidth={1.8} />,
  },
  {
    label: 'Trust and Compliance',
    href: '/trust-compliance',
    icon: <ShieldCheck className="h-[22px] w-[22px]" strokeWidth={1.8} />,
  },
];

const BOTTOM_ITEMS: NavItemType[] = [
  { label: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push('/login');
  };

  return (
    <aside id="tour-sidebar" className='hidden lg:flex flex-col w-55 min-h-screen bg-white border-r border-slate-200 shrink-0'>
      {/* Logo */}
      <div className='flex items-center h-[88px] px-5 border-b border-slate-200 shrink-0'>
        <Link href='/dashboard' className='flex items-center w-full'>
          <Image
            src='/images/logo-auth.png'
            alt='VulnWatch AI'
            width={140}
            height={48}
            className='h-auto w-48'
            priority
          />
        </Link>
      </div>

      {/* Main nav */}
      <nav className='flex-1 px-3 py-5 space-y-2.5'>
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-700 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <div className='flex items-center justify-center shrink-0'>
                {label === 'Dashboard' ? (
                  <DashboardSidebarIcon className='h-5 w-5' isActive={isActive} />
                ) : label === 'Domain' ? (
                  <DomainSidebarIcon className='h-5 w-5' isActive={isActive} />
                ) : label === 'Report' ? (
                  <ReportSidebarIcon className='h-5 w-5' isActive={isActive} />
                ) : label === 'Settings' ? (
                  <SettingsIcon className='h-5 w-5' isActive={isActive} />
                ) : (
                  icon
                )}
              </div>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className='px-3 pb-5 space-y-2.5 border-t border-gray-200 pt-4'>
        {BOTTOM_ITEMS.map(({ label, href, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              id={label === 'Settings' ? 'tour-resources' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-700 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <div className='flex items-center justify-center shrink-0'>
                {label === 'Settings' ? (
                  <SettingsIcon className='h-5 w-5' isActive={isActive} />
                ) : (
                  icon
                )}
              </div>
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-gray-100 hover:text-gray-900 transition-colors'
        >
          <div className='flex items-center justify-center shrink-0'>
            <LogOut className='h-5 w-5 shrink-0' strokeWidth={1.8} />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
}
