'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Globe,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  GitFork,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Domain', href: '/domain', icon: Globe },
  { label: 'Report', href: '/report', icon: FileText },
  { label: 'Repositories', href: '/repositories', icon: GitFork },
  { label: 'Trust and Compliance', href: '/trust-compliance', icon: ShieldCheck },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

function getPageHeaderInfo(pathname: string) {
  if (pathname.startsWith('/dashboard')) {
    return { title: 'Dashboard', description: 'Overview of your security posture' };
  }
  if (pathname.startsWith('/domain')) {
    return { title: 'Domains', description: 'Manage and verify your domains' };
  }
  if (pathname.startsWith('/report') || pathname.startsWith('/scan')) {
    return { title: 'Report Overview', description: 'Summary of all security reports' };
  }
  if (pathname.startsWith('/repositories')) {
    return { title: 'GitHub Security Intelligence', description: 'Monitor your software supply chain for vulnerabilities and security risks' };
  }
  if (pathname.startsWith('/trust-compliance')) {
    return { title: 'Trust and Compliance', description: 'Demonstrate your security posture and protect your brand identity' };
  }
  if (pathname.startsWith('/settings')) {
    return { title: 'Settings', description: 'Manage your account and preferences' };
  }
  return { title: '', description: '' };
}

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { title, description } = getPageHeaderInfo(pathname);

  const authState = useSyncExternalStore(
    useAuthStore.subscribe,
    useAuthStore.getState,
    () => ({ token: null, email: null, picture: null, firstName: null, lastName: null, login: () => {}, logout: () => {}, updateProfile: () => {} })
  );

  const { email, picture, firstName, lastName } = authState;
  const displayEmail = email ?? 'user@company.com';
  
  let displayName = displayEmail.split('@')[0] ?? 'User';
  let initials = displayName.slice(0, 2).toUpperCase();

  if (firstName || lastName) {
    displayName = `${firstName || ''} ${lastName || ''}`.trim();
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    initials = (firstInitial + lastInitial).toUpperCase() || displayName.slice(0, 2).toUpperCase();
  }

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push('/login');
  };
  return (
    <>
      <header className={cn(
        'h-[88px] bg-white border-b border-slate-200 items-center px-4 md:px-6 shrink-0 z-30 justify-between md:justify-start',
        pathname.startsWith('/scan/report') ? 'hidden lg:flex' : 'flex'
      )}>
        {/* Hamburger (Mobile: Right, Tablet: Left) */}
        <button
          id='tour-mobile-menu'
          type='button'
          onClick={() => setMobileMenuOpen(true)}
          className='lg:hidden text-brand-dark p-1 order-2 md:order-1 md:mr-4'
          aria-label='Open menu'
        >
          <Menu className='h-6 w-6' />
        </button>

        {/* Logo (Mobile: Left, Tablet: Left next to menu) */}
        <Link href='/dashboard' className='lg:hidden order-1 md:order-2 shrink-0'>
          <Image
            src='/images/logo-dashboard-mobile.png'
            alt='VulnWatch AI'
            width={140}
            height={32}
            className='h-6 w-auto'
          />
        </Link>

        {/* Page Title (lg+ only) */}
        <div className="hidden lg:flex flex-col ml-8 lg:ml-0 order-3 items-start gap-1">
          <h1
            style={{
              fontFamily: 'Geist, sans-serif',
              fontWeight: 600,
              fontSize: '28px',
              lineHeight: '28px',
              letterSpacing: '0.005em',
              color: '#2B2B2B',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontFamily: 'Geist, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '14px',
                letterSpacing: '0.02em',
                color: '#666666',
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right side (User Avatar) */}
        <div className='items-center gap-4 ml-auto order-4 hidden md:flex'>
          {/* User avatar */}
          <div id="tour-header-profile" className='relative hidden md:block'>
            <div className='flex items-center gap-2 bg-brand-bg rounded-[12px] px-2.5 py-1'>
              {picture ? (
                <Image
                  src={picture}
                  alt={displayName}
                  width={32}
                  height={32}
                  className='h-8 w-8 rounded-[14.39px] object-cover shrink-0'
                />
              ) : (
                <div className='h-8 w-8 rounded-[14.39px] bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0'>
                  {initials}
                </div>
              )}
              <div className='flex flex-col items-start leading-none pr-1'>
                <span className='text-sm font-medium text-brand-dark capitalize'>
                  {displayName}
                </span>
                <span className='text-xs text-brand-muted mt-0.5'>
                  {displayEmail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className='fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-200'
        style={{
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden='true'
      />
      <div
        className='fixed inset-y-0 left-0 z-50 w-65 bg-white shadow-xl flex flex-col lg:hidden transition-transform duration-300'
        style={{
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div className='flex items-center justify-between h-16 px-4 border-b border-slate-200'>
          <Link href='/dashboard'>
            <Image
              src='/images/logo-dashboard-mobile.png'
              alt='VulnWatch AI'
              width={140}
              height={32}
              className='h-6 w-auto'
            />
          </Link>
          <button
            type='button'
            onClick={() => setMobileMenuOpen(false)}
            className='text-brand-gray'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-700 hover:bg-gray-100',
                )}
              >
                <Icon className='h-5 w-5 shrink-0' strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className='px-3 pb-6 border-t border-gray-200 pt-4 space-y-1'>
          {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
            return (
              <Link
                key={href}
                id={label === 'Settings' ? 'tour-mobile-settings' : undefined}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-700 hover:bg-gray-100',
                )}
              >
                <Icon className='h-5 w-5 shrink-0' strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50'
          >
            <LogOut className='h-5 w-5' strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
